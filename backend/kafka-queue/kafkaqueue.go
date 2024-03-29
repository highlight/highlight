package kafka_queue

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl"
	"github.com/segmentio/kafka-go/sasl/scram"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/util"
	hmetric "github.com/highlight/highlight/sdk/highlight-go/metric"
)

// KafkaOperationTimeout If an ECS task is being replaced, there's a 30 second window to do cleanup work. A shorter timeout means we shouldn't be killed mid-operation.
const KafkaOperationTimeout = 25 * time.Second

const ConsumerGroupName = "group-default"

const (
	TaskRetries           = 2
	prefetchQueueCapacity = 1000
	MaxMessageSizeBytes   = 128 * 1024 * 1024 // MiB
)

var (
	EnvironmentPrefix = func() string {
		prefix := os.Getenv("KAFKA_ENV_PREFIX")
		if len(prefix) > 0 {
			return prefix
		} else {
			return os.Getenv("DOPPLER_CONFIG")
		}
	}()
)

type Mode int

const (
	Producer Mode = 1 << iota
	Consumer Mode = 1 << iota
)

type Queue struct {
	Topic            string
	ConsumerGroup    string
	MessageSizeBytes int64
	Client           *kafka.Client
	kafkaP           *kafka.Writer
	kafkaC           *kafka.Reader
}

type MessageQueue interface {
	Stop(context.Context)
	Receive(context.Context) RetryableMessage
	Submit(context.Context, string, ...RetryableMessage) error
	LogStats()
}

type TopicType string

const (
	TopicTypeDefault  TopicType = "default"
	TopicTypeBatched  TopicType = "batched"
	TopicTypeDataSync TopicType = "datasync"
	TopicTypeTraces   TopicType = "traces"
)

type GetTopicOptions struct {
	Type TopicType
}

func GetTopic(options GetTopicOptions) string {
	topic := os.Getenv("KAFKA_TOPIC")
	if util.IsDevOrTestEnv() {
		topic = fmt.Sprintf("%s_%s", EnvironmentPrefix, topic)
	}
	if options.Type != TopicTypeDefault {
		topic = fmt.Sprintf("%s_%s", topic, string(options.Type))
	}
	return topic
}

type ConfigOverride struct {
	Async            *bool
	QueueCapacity    *int
	MinBytes         *int
	MaxWait          *time.Duration
	MessageSizeBytes *int64
	OnAssignGroups   func()
}

func getLogger(mode, topic string, level log.Level) kafka.LoggerFunc {
	lg := log.WithFields(log.Fields{
		"code.module": "kafkaqueue",
		"mode":        mode,
		"topic":       topic,
	})
	if level == log.ErrorLevel {
		return lg.Errorf
	}
	return lg.Debugf
}

func New(ctx context.Context, topic string, mode Mode, configOverride *ConfigOverride) *Queue {
	servers := os.Getenv("KAFKA_SERVERS")
	brokers := strings.Split(servers, ",")
	groupID := strings.Join([]string{ConsumerGroupName, topic}, "_")

	tlsConfig := &tls.Config{
		MinVersion: tls.VersionTLS12,
	}
	var mechanism sasl.Mechanism
	var dialer *kafka.Dialer
	var transport *kafka.Transport
	var client *kafka.Client
	if util.IsInDocker() {
		dialer = &kafka.Dialer{
			Timeout:   KafkaOperationTimeout,
			DualStack: true,
		}
		transport = &kafka.Transport{
			DialTimeout: KafkaOperationTimeout,
			IdleTimeout: KafkaOperationTimeout,
		}
		client = &kafka.Client{
			Addr:      kafka.TCP(brokers...),
			Transport: transport,
		}
	} else {
		var err error
		mechanism, err = scram.Mechanism(scram.SHA512, os.Getenv("KAFKA_SASL_USERNAME"), os.Getenv("KAFKA_SASL_PASSWORD"))
		if err != nil {
			log.WithContext(ctx).Fatal(errors.Wrap(err, "failed to authenticate with kafka"))
		}
		dialer = &kafka.Dialer{
			Timeout:       KafkaOperationTimeout,
			DualStack:     true,
			SASLMechanism: mechanism,
			TLS:           tlsConfig,
		}
		transport = &kafka.Transport{
			SASL:        mechanism,
			TLS:         tlsConfig,
			DialTimeout: KafkaOperationTimeout,
			IdleTimeout: KafkaOperationTimeout,
		}
		client = &kafka.Client{
			Addr:      kafka.TCP(brokers...),
			Transport: transport,
		}
	}

	rebalanceTimeout := 1 * time.Minute
	if util.IsDevOrTestEnv() {
		// faster rebalance for dev to start processing quicker
		rebalanceTimeout = time.Second
		// create per-profile consumer and topic to avoid collisions between dev envs
		groupID = fmt.Sprintf("%s_%s", EnvironmentPrefix, groupID)
		_, err := client.CreateTopics(ctx, &kafka.CreateTopicsRequest{
			Topics: []kafka.TopicConfig{{
				Topic:             topic,
				NumPartitions:     8,
				ReplicationFactor: 1,
			}},
		})
		if err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to create dev topic"))
		}
	}

	pool := &Queue{Topic: topic, ConsumerGroup: groupID, Client: client, MessageSizeBytes: MaxMessageSizeBytes}
	if mode&1 == 1 {
		pool.kafkaP = &kafka.Writer{
			Addr:         kafka.TCP(brokers...),
			Transport:    transport,
			Topic:        pool.Topic,
			Balancer:     &kafka.Hash{},
			RequiredAcks: kafka.RequireOne,
			Compression:  kafka.Zstd,
			Async:        true,
			BatchSize:    1_000,
			BatchBytes:   MaxMessageSizeBytes,
			BatchTimeout: 5 * time.Second,
			ReadTimeout:  KafkaOperationTimeout,
			WriteTimeout: KafkaOperationTimeout,
			Logger:       getLogger("producer", topic, log.InfoLevel),
			ErrorLogger:  getLogger("producer", topic, log.ErrorLevel),
		}

		if configOverride != nil {
			deref := *configOverride
			if deref.Async != nil {
				pool.kafkaP.Async = *deref.Async
				pool.kafkaP.BatchSize = 1_000
			}
			if deref.MessageSizeBytes != nil {
				pool.kafkaP.BatchBytes = *deref.MessageSizeBytes
				pool.MessageSizeBytes = *deref.MessageSizeBytes
			}
		}

		if !util.IsDevOrTestEnv() {
			log.WithContext(ctx).
				WithField("topic", topic).
				Infof("initializing kafka producer %+v", pool.kafkaP)
		}
	}
	if (mode>>1)&1 == 1 {
		rack := findRack()
		var onAssignGroups func()
		if configOverride != nil {
			onAssignGroups = (*configOverride).OnAssignGroups
		}
		config := kafka.ReaderConfig{
			Brokers:           brokers,
			Dialer:            dialer,
			HeartbeatInterval: time.Second,
			ReadLagInterval:   time.Second,
			RebalanceTimeout:  rebalanceTimeout,
			Topic:             pool.Topic,
			GroupID:           pool.ConsumerGroup,
			MinBytes:          1,
			MaxBytes:          2 * MaxMessageSizeBytes,
			MaxWait:           time.Second,
			ReadBatchTimeout:  KafkaOperationTimeout,
			QueueCapacity:     prefetchQueueCapacity,
			// in the future, we would commit only on successful processing of a message.
			// this means we commit very often to avoid repeating tasks on worker restart.
			CommitInterval: time.Second,
			Logger:         getLogger("consumer", topic, log.InfoLevel),
			ErrorLogger:    getLogger("consumer", topic, log.ErrorLevel),
			GroupBalancers: []kafka.GroupBalancer{
				&BalancerWrapper{
					balancer:       kafka.RoundRobinGroupBalancer{},
					onAssignGroups: onAssignGroups,
				},
			},
		}

		if configOverride != nil {
			deref := *configOverride
			if deref.QueueCapacity != nil {
				config.QueueCapacity = *deref.QueueCapacity
			}
			if deref.MinBytes != nil {
				config.MinBytes = *deref.MinBytes
			}
			if deref.MaxWait != nil {
				config.MaxWait = *deref.MaxWait
			}
			if deref.MessageSizeBytes != nil {
				config.MaxBytes = int(*deref.MessageSizeBytes)
				pool.MessageSizeBytes = *deref.MessageSizeBytes
			}
		}

		if !util.IsDevOrTestEnv() {
			log.WithContext(ctx).
				WithField("topic", topic).
				WithField("rack", rack).
				Infof("initializing kafka consumer %+v", config)
		}

		pool.kafkaC = kafka.NewReader(config)
	}

	go func() {
		for {
			pool.LogStats()
			time.Sleep(5 * time.Second)
		}
	}()

	return pool
}

func (p *Queue) metricPrefix() string {
	return fmt.Sprintf("worker.kafka.%s.", p.Topic)
}

func (p *Queue) Stop(ctx context.Context) {
	if p.kafkaC != nil {
		if err := p.kafkaC.Close(); err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to close reader"))
		}
		p.kafkaC = nil
	}
	if p.kafkaP != nil {
		if err := p.kafkaP.Close(); err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to close writer"))
		}
		p.kafkaP = nil
	}
}

func (p *Queue) Submit(ctx context.Context, partitionKey string, messages ...RetryableMessage) error {
	if len(messages) == 0 {
		return nil
	}

	start := time.Now()
	if partitionKey == "" {
		partitionKey = util.GenerateRandomString(32)
	}

	var kMessages []kafka.Message
	for _, msg := range messages {
		msg.SetMaxRetries(TaskRetries)
		msgBytes, err := p.serializeMessage(msg)
		if err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to serialize message"))
			return err
		}
		if int64(len(msgBytes)) >= p.MessageSizeBytes/2 {
			log.WithContext(ctx).WithField("topic", p.Topic).WithField("partitionKey", partitionKey).WithField("msgBytes", len(msgBytes)).Warn("large kafka message")
		}
		kMessages = append(kMessages, kafka.Message{
			Key:   []byte(partitionKey),
			Value: msgBytes,
		})
		hmetric.Incr(ctx, p.metricPrefix()+"produceMessageCount", nil, 1)
	}

	ctx, cancel := context.WithTimeout(ctx, KafkaOperationTimeout)
	defer cancel()
	err := p.kafkaP.WriteMessages(ctx, kMessages...)
	if err != nil {
		log.WithContext(ctx).WithError(err).WithField("topic", p.Topic).WithField("partition_key", partitionKey).WithField("num_messages", len(messages)).Errorf("failed to send kafka messages")
		return err
	}
	hmetric.Histogram(ctx, p.metricPrefix()+"submitSec", time.Since(start).Seconds(), nil, 1)
	return nil
}

func (p *Queue) Receive(ctx context.Context) (msg RetryableMessage) {
	start := time.Now()
	ctx, cancel := context.WithTimeout(ctx, KafkaOperationTimeout)
	defer cancel()
	m, err := p.kafkaC.FetchMessage(ctx)
	if err != nil {
		if err.Error() != "context deadline exceeded" {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to receive message"))
		}
		return nil
	}
	msg, err = p.deserializeMessage(m.Value)
	if err != nil {
		log.WithContext(ctx).WithField("topic", p.Topic).WithField("partition", m.Partition).WithField("msgBytes", len(m.Value)).Error(errors.Wrap(err, "failed to deserialize message"))
		return nil
	}
	msg.SetKafkaMessage(&m)
	hmetric.Incr(ctx, p.metricPrefix()+"consumeMessageCount", nil, 1)
	hmetric.Histogram(ctx, p.metricPrefix()+"receiveSec", time.Since(start).Seconds(), nil, 1)
	return
}

func (p *Queue) Rewind(ctx context.Context, dur time.Duration) error {
	ts := time.Now().Add(-dur)

	resp, err := p.Client.Metadata(ctx, &kafka.MetadataRequest{
		Addr:   p.Client.Addr,
		Topics: []string{p.Topic},
	})
	if err != nil {
		return errors.Wrap(err, "failed to read topic partitions")
	}
	numPartitions := len(resp.Topics[0].Partitions)

	var requests []kafka.OffsetRequest
	for partition := 0; partition < numPartitions; partition++ {
		requests = append(requests, kafka.TimeOffsetOf(partition, ts))
	}
	offsets, err := p.Client.ListOffsets(ctx, &kafka.ListOffsetsRequest{
		Addr: p.Client.Addr,
		Topics: map[string][]kafka.OffsetRequest{
			p.Topic: requests,
		},
		IsolationLevel: kafka.ReadCommitted,
	})
	if err != nil {
		return errors.Wrap(err, "failed to list offsets")
	}

	desiredOffsets := map[int]int64{}
	for _, offset := range offsets.Topics[p.Topic] {
		// ListOffsets for a TimeOffsetOf request returns offset -> date map.
		// since we make one TimeOffsetOf request per partition, there is only
		// one key returned in each partition map.
		off := lo.Keys(offset.Offsets)[0]
		if off != -1 {
			desiredOffsets[offset.Partition] = off
		} else {
			log.WithContext(ctx).Warnf("no offset exists for ts %s on partition %d", ts, offset.Partition)
		}
	}

	log.WithContext(ctx).Infof("resetting kafka offsets for %s based on desired time %s: %+v", p.Topic, ts, desiredOffsets)
	return p.resetConsumerOffset(ctx, desiredOffsets)
}

func (p *Queue) Commit(ctx context.Context, msg *kafka.Message) {
	start := time.Now()
	ctx, cancel := context.WithTimeout(ctx, KafkaOperationTimeout)
	defer cancel()
	err := p.kafkaC.CommitMessages(ctx, *msg)
	if err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "failed to commit message"))
	} else {
		hmetric.Incr(ctx, p.metricPrefix()+"commitMessageCount", nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"commitSec", time.Since(start).Seconds(), nil, 1)
	}
}

func (p *Queue) LogStats() {
	ctx := context.Background()
	if p.kafkaP != nil {
		stats := p.kafkaP.Stats()
		log.WithContext(ctx).WithField("topic", stats.Topic).WithField("stats", stats).Debug("Kafka Producer Stats")

		hmetric.Histogram(ctx, p.metricPrefix()+"produceBatchAvgSec", stats.BatchTime.Avg.Seconds(), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceWriteAvgSec", stats.WriteTime.Avg.Seconds(), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceWaitAvgSec", stats.WaitTime.Avg.Seconds(), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceBatchSize", float64(stats.BatchSize.Avg), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceBatchBytes", float64(stats.BatchBytes.Avg), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceQueueCapacity", float64(stats.QueueCapacity), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceQueueLength", float64(stats.QueueLength), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceBytes", float64(stats.Bytes), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"produceErrors", float64(stats.Errors), nil, 1)
	}
	if p.kafkaC != nil {
		stats := p.kafkaC.Stats()
		log.WithContext(context.Background()).WithField("topic", stats.Topic).WithField("partition", stats.Partition).WithField("stats", stats).Debug("Kafka Consumer Stats")

		hmetric.Histogram(ctx, p.metricPrefix()+"consumeReadAvgSec", stats.ReadTime.Avg.Seconds(), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"consumeWaitAvgSec", stats.WaitTime.Avg.Seconds(), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"consumeFetchSize", float64(stats.FetchSize.Avg), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"consumeFetchBytes", float64(stats.FetchBytes.Avg), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"consumeQueueCapacity", float64(stats.QueueCapacity), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"consumeQueueLength", float64(stats.QueueLength), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"consumeBytes", float64(stats.Bytes), nil, 1)
		hmetric.Histogram(ctx, p.metricPrefix()+"consumeErrors", float64(stats.Errors), nil, 1)
	}
}

func (p *Queue) serializeMessage(msg RetryableMessage) (compressed []byte, err error) {
	compressed, err = json.Marshal(&msg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshall json")
	}
	return
}

func (p *Queue) deserializeMessage(compressed []byte) (RetryableMessage, error) {
	if int64(len(compressed)) >= p.MessageSizeBytes {
		return nil, errors.New("message too large")
	}
	var msgType struct {
		Type PayloadType
	}
	if err := json.Unmarshal(compressed, &msgType); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshall message type")
	}

	var msg RetryableMessage
	if msgType.Type == PushLogsFlattened {
		msg = &LogRowMessage{}
	} else if msgType.Type == PushTracesFlattened {
		msg = &TraceRowMessage{}
	} else {
		msg = &Message{}
	}

	if err := json.Unmarshal(compressed, &msg); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshall message")
	}

	return msg, nil
}

func (p *Queue) resetConsumerOffset(ctx context.Context, partitionOffsets map[int]int64) (error error) {
	cfg := p.kafkaC.Config()
	group, err := kafka.NewConsumerGroup(kafka.ConsumerGroupConfig{
		ID:      strings.Join([]string{ConsumerGroupName, p.Topic}, "_"),
		Brokers: cfg.Brokers,
		Dialer:  cfg.Dialer,
		Topics:  []string{cfg.Topic},
		Timeout: KafkaOperationTimeout,
	})
	if err != nil {
		return errors.Wrap(err, "failed to create consumer group")
	}

	gen, err := group.Next(ctx)
	if err != nil {
		return errors.Wrap(err, "failed to establish next group generation")
	}
	err = gen.CommitOffsets(map[string]map[int]int64{cfg.Topic: partitionOffsets})
	if err != nil {
		return errors.Wrap(err, "failed to commit new offsets")
	}

	if err = group.Close(); err != nil {
		return errors.Wrap(err, "failed to close consumer group")
	}
	log.WithContext(ctx).Infof("reset consumer offsets: %+v", partitionOffsets)
	return
}

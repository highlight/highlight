package kafka_queue

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/samber/lo"
	"github.com/segmentio/kafka-go/sasl"

	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/scram"
	log "github.com/sirupsen/logrus"
)

// KafkaOperationTimeout If an ECS task is being replaced, there's a 30 second window to do cleanup work. A shorter timeout means we shouldn't be killed mid-operation.
const KafkaOperationTimeout = 25 * time.Second

const ConsumerGroupName = "group-default"

const (
	taskRetries           = 5
	prefetchQueueCapacity = 64
	prefetchSizeBytes     = 64 * 1000         // 64 KB
	messageSizeBytes      = 500 * 1000 * 1000 // 500 MB
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
	Topic         string
	ConsumerGroup string
	Client        *kafka.Client
	kafkaP        *kafka.Writer
	kafkaC        *kafka.Reader
}

type MessageQueue interface {
	Stop(context.Context)
	Receive(context.Context) *Message
	Submit(context.Context, string, ...*Message) error
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
	Async         *bool
	QueueCapacity *int
}

func New(ctx context.Context, topic string, mode Mode, configOverride *ConfigOverride) *Queue {
	servers := os.Getenv("KAFKA_SERVERS")
	brokers := strings.Split(servers, ",")
	groupID := ConsumerGroupName

	tlsConfig := &tls.Config{}
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

	pool := &Queue{Topic: topic, ConsumerGroup: groupID, Client: client}
	if mode&1 == 1 {
		log.WithContext(ctx).Debugf("initializing kafka producer for %s", topic)
		pool.kafkaP = &kafka.Writer{
			Addr:         kafka.TCP(brokers...),
			Transport:    transport,
			Topic:        pool.Topic,
			Balancer:     &kafka.Hash{},
			RequiredAcks: kafka.RequireOne,
			Compression:  kafka.Zstd,
			// synchronous mode so that we can ensure messages are sent before we return
			Async: false,
			// override batch limit to be our message max size
			BatchBytes:   messageSizeBytes,
			BatchSize:    1,
			ReadTimeout:  KafkaOperationTimeout,
			WriteTimeout: KafkaOperationTimeout,
			// low timeout because we don't want to block WriteMessage calls since we are sync mode
			BatchTimeout: 1 * time.Millisecond,
			MaxAttempts:  10,
		}

		if configOverride != nil {
			deref := *configOverride
			if deref.Async != nil {
				pool.kafkaP.Async = *deref.Async
			}
		}
	}
	if (mode>>1)&1 == 1 {
		log.WithContext(ctx).Debugf("initializing kafka consumer for %s", topic)
		config := kafka.ReaderConfig{
			Brokers:           brokers,
			Dialer:            dialer,
			HeartbeatInterval: time.Second,
			SessionTimeout:    10 * time.Second,
			RebalanceTimeout:  rebalanceTimeout,
			Topic:             pool.Topic,
			GroupID:           pool.ConsumerGroup,
			MinBytes:          prefetchSizeBytes,
			MaxBytes:          messageSizeBytes,
			QueueCapacity:     prefetchQueueCapacity,
			// in the future, we would commit only on successful processing of a message.
			// this means we commit very often to avoid repeating tasks on worker restart.
			CommitInterval: time.Second,
			MaxAttempts:    10,
		}

		if configOverride != nil {
			deref := *configOverride
			if deref.QueueCapacity != nil {
				config.QueueCapacity = *deref.QueueCapacity
			}
		}

		pool.kafkaC = kafka.NewReader(config)
	}

	go func() {
		for {
			pool.LogStats()
			time.Sleep(time.Second)
		}
	}()

	return pool
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

func (p *Queue) Submit(ctx context.Context, partitionKey string, messages ...*Message) error {
	start := time.Now()
	if partitionKey == "" {
		partitionKey = util.GenerateRandomString(32)
	}

	var kMessages []kafka.Message
	for _, msg := range messages {
		msg.MaxRetries = taskRetries
		msgBytes, err := p.serializeMessage(msg)
		if err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to serialize message"))
			return err
		}
		kMessages = append(kMessages, kafka.Message{
			Key:   []byte(partitionKey),
			Value: msgBytes,
		})
	}

	ctx, cancel := context.WithTimeout(ctx, KafkaOperationTimeout)
	defer cancel()
	err := p.kafkaP.WriteMessages(ctx, kMessages...)
	if err != nil {
		log.WithContext(ctx).WithError(err).WithField("partition_key", partitionKey).WithField("num_messages", len(messages)).Errorf("failed to send kafka messages")
		return err
	}
	hlog.Incr("worker.kafka.produceMessageCount", nil, 1)
	hlog.Histogram("worker.kafka.submitSec", time.Since(start).Seconds(), nil, 1)
	return nil
}

func (p *Queue) Receive(ctx context.Context) (msg *Message) {
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
		log.WithContext(ctx).Error(errors.Wrap(err, "failed to deserialize message"))
		return nil
	}
	msg.KafkaMessage = &m
	hlog.Incr("worker.kafka.consumeMessageCount", nil, 1)
	hlog.Histogram("worker.kafka.receiveSec", time.Since(start).Seconds(), nil, 1)
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
		hlog.Incr("worker.kafka.commitMessageCount", nil, 1)
		hlog.Histogram("worker.kafka.commitSec", time.Since(start).Seconds(), nil, 1)
	}
}

func (p *Queue) LogStats() {
	if p.kafkaP != nil {
		stats := p.kafkaP.Stats()
		log.WithContext(context.Background()).Debugf("Kafka Producer Stats: count %d. batchAvg %s. writeAvg %s. waitAvg %s", stats.Messages, stats.BatchTime.Avg, stats.WriteTime.Avg, stats.WaitTime.Avg)

		hlog.Histogram("worker.kafka.produceBatchAvgSec", stats.BatchTime.Avg.Seconds(), nil, 1)
		hlog.Histogram("worker.kafka.produceWriteAvgSec", stats.WriteTime.Avg.Seconds(), nil, 1)
		hlog.Histogram("worker.kafka.produceWaitAvgSec", stats.WaitTime.Avg.Seconds(), nil, 1)
		hlog.Histogram("worker.kafka.produceBatchSize", float64(stats.BatchSize.Avg), nil, 1)
		hlog.Histogram("worker.kafka.produceBatchBytes", float64(stats.BatchBytes.Avg), nil, 1)
		hlog.Histogram("worker.kafka.produceQueueCapacity", float64(stats.QueueCapacity), nil, 1)
		hlog.Histogram("worker.kafka.produceQueueLength", float64(stats.QueueLength), nil, 1)
		hlog.Histogram("worker.kafka.produceBytes", float64(stats.Bytes), nil, 1)
		hlog.Histogram("worker.kafka.produceErrors", float64(stats.Errors), nil, 1)
	}
	if p.kafkaC != nil {
		stats := p.kafkaC.Stats()
		log.WithContext(context.Background()).Debugf("Kafka Consumer Stats: count %d. readAvg %s. waitAvg %s", stats.Messages, stats.ReadTime.Avg, stats.WaitTime.Avg)

		hlog.Histogram("worker.kafka.consumeReadAvgSec", stats.ReadTime.Avg.Seconds(), nil, 1)
		hlog.Histogram("worker.kafka.consumeWaitAvgSec", stats.WaitTime.Avg.Seconds(), nil, 1)
		hlog.Histogram("worker.kafka.consumeFetchSize", float64(stats.FetchSize.Avg), nil, 1)
		hlog.Histogram("worker.kafka.consumeFetchBytes", float64(stats.FetchBytes.Avg), nil, 1)
		hlog.Histogram("worker.kafka.consumeQueueCapacity", float64(stats.QueueCapacity), nil, 1)
		hlog.Histogram("worker.kafka.consumeQueueLength", float64(stats.QueueLength), nil, 1)
		hlog.Histogram("worker.kafka.consumeBytes", float64(stats.Bytes), nil, 1)
		hlog.Histogram("worker.kafka.consumeErrors", float64(stats.Errors), nil, 1)
	}
}

func (p *Queue) serializeMessage(msg *Message) (compressed []byte, err error) {
	compressed, err = json.Marshal(&msg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshall json")
	}
	return
}

func (p *Queue) deserializeMessage(compressed []byte) (msg *Message, error error) {
	if err := json.Unmarshal(compressed, &msg); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshall msg")
	}
	return
}

func (p *Queue) resetConsumerOffset(ctx context.Context, partitionOffsets map[int]int64) (error error) {
	cfg := p.kafkaC.Config()
	group, err := kafka.NewConsumerGroup(kafka.ConsumerGroupConfig{
		ID:      ConsumerGroupName,
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

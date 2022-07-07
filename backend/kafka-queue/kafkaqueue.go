package kafka_queue

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/DmitriyVTitov/size"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/scram"
	log "github.com/sirupsen/logrus"
)

// KafkaOperationTimeout If an ECS task is being replaced, there's a 30 second window to do cleanup work. A shorter timeout means we shouldn't be killed mid-operation.
const KafkaOperationTimeout = 25 * time.Second

const (
	taskRetries           = 5
	prefetchQueueCapacity = 128
	prefetchSizeBytes     = 1 * 1000 * 1000   // 1 MB
	messageSizeBytes      = 500 * 1000 * 1000 // 500 MB
)

var (
	EnvironmentPrefix string = func() string {
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
	kafkaP        *kafka.Writer
	kafkaC        *kafka.Reader
}

type MessageQueue interface {
	Stop()
	Receive() *Message
	Submit(*Message, int)
	LogStats()
}

func New(topic string, mode Mode) *Queue {
	servers := os.Getenv("KAFKA_SERVERS")
	brokers := strings.Split(servers, ",")
	tlsConfig := &tls.Config{}
	mechanism, err := scram.Mechanism(scram.SHA512, os.Getenv("KAFKA_SASL_USERNAME"), os.Getenv("KAFKA_SASL_PASSWORD"))
	if err != nil {
		log.Fatal(errors.Wrap(err, "failed to authenticate with kafka"))
	}

	groupID := "group-default"
	if util.IsDevOrTestEnv() {
		// create per-profile consumer and topic to avoid collisions between dev envs
		groupID = fmt.Sprintf("%s_%s", EnvironmentPrefix, groupID)
		topic = fmt.Sprintf("%s_%s", EnvironmentPrefix, topic)

		client := &kafka.Client{
			Addr: kafka.TCP(brokers...),
			Transport: &kafka.Transport{
				SASL: mechanism,
				TLS:  tlsConfig,
			},
		}
		_, err = client.CreateTopics(context.Background(), &kafka.CreateTopicsRequest{
			Topics: []kafka.TopicConfig{{
				Topic:             topic,
				NumPartitions:     8,
				ReplicationFactor: 2,
			}},
		})
		if err != nil {
			log.Error(errors.Wrap(err, "failed to create dev topic"))
		}
		res, err := client.AlterConfigs(context.Background(), &kafka.AlterConfigsRequest{
			Addr: kafka.TCP(brokers...),
			Resources: []kafka.AlterConfigRequestResource{
				{
					ResourceType: kafka.ResourceTypeTopic,
					ResourceName: topic,
					Configs: []kafka.AlterConfigRequestConfig{
						{
							Name:  "delete.retention.ms",
							Value: "604800000",
						},
					},
				},
			},
		})
		if err != nil {
			log.Error(errors.Wrap(err, "failed to update topic retention"))
		} else {
			err = res.Errors[kafka.AlterConfigsResponseResource{
				Type: int8(kafka.ResourceTypeTopic),
				Name: topic,
			}]
			if err != nil {
				log.Error(errors.Wrap(err, "topic retention failed server-side"))
			}
		}
	}

	pool := &Queue{Topic: topic, ConsumerGroup: groupID}
	if mode&1 == 1 {
		log.Infof("initializing kafka producer for %s", topic)
		pool.kafkaP = &kafka.Writer{
			Addr: kafka.TCP(brokers...),
			Transport: &kafka.Transport{
				SASL:        mechanism,
				TLS:         tlsConfig,
				DialTimeout: KafkaOperationTimeout,
				IdleTimeout: KafkaOperationTimeout,
			},
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
	}
	if (mode>>1)&1 == 1 {
		log.Infof("initializing kafka consumer for %s", topic)
		pool.kafkaC = kafka.NewReader(kafka.ReaderConfig{
			Brokers: brokers,
			Dialer: &kafka.Dialer{
				Timeout:       KafkaOperationTimeout,
				DualStack:     true,
				SASLMechanism: mechanism,
				TLS:           tlsConfig,
			},
			HeartbeatInterval: time.Second,
			SessionTimeout:    10 * time.Second,
			RebalanceTimeout:  10 * time.Second,
			Topic:             pool.Topic,
			GroupID:           pool.ConsumerGroup,
			MinBytes:          prefetchSizeBytes,
			MaxBytes:          messageSizeBytes,
			QueueCapacity:     prefetchQueueCapacity,
			// in the future, we would commit only on successful processing of a message.
			// this means we commit very often to avoid repeating tasks on worker restart.
			CommitInterval: time.Second,
			MaxAttempts:    10,
		})
	}

	go func() {
		for {
			pool.LogStats()
			time.Sleep(time.Second)
		}
	}()

	return pool
}

func (p *Queue) Stop() {
	if p.kafkaC != nil {
		if err := p.kafkaC.Close(); err != nil {
			log.Error(errors.Wrap(err, "failed to close reader"))
		}
		p.kafkaC = nil
	}
	if p.kafkaP != nil {
		if err := p.kafkaP.Close(); err != nil {
			log.Error(errors.Wrap(err, "failed to close writer"))
		}
		p.kafkaP = nil
	}
}

func (p *Queue) Submit(msg *Message, partitionKey string) error {
	start := time.Now()
	msg.MaxRetries = taskRetries
	msgBytes, err := p.serializeMessage(msg)
	if err != nil {
		log.Error(errors.Wrap(err, "failed to serialize message"))
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), KafkaOperationTimeout)
	defer cancel()
	err = p.kafkaP.WriteMessages(ctx,
		kafka.Message{
			Key:   []byte(partitionKey),
			Value: msgBytes,
		},
	)
	if err != nil {
		log.Errorf("failed to send message, size %d, err %s", size.Of(msgBytes), err.Error())
		return err
	}
	hlog.Incr("worker.kafka.produceMessageCount", nil, 1)
	hlog.Histogram("worker.kafka.submitSec", time.Since(start).Seconds(), nil, 1)
	return nil
}

func (p *Queue) Receive() (msg *Message) {
	start := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), KafkaOperationTimeout)
	defer cancel()
	m, err := p.kafkaC.ReadMessage(ctx)
	if err != nil {
		log.Error(errors.Wrap(err, "failed to receive message"))
		return nil
	}
	msg, err = p.deserializeMessage(m.Value)
	if err != nil {
		log.Error(errors.Wrap(err, "failed to deserialize message"))
		return nil
	}
	msg.KafkaMessage = &m
	hlog.Incr("worker.kafka.consumeMessageCount", nil, 1)
	hlog.Histogram("worker.kafka.receiveSec", time.Since(start).Seconds(), nil, 1)
	return
}

func (p *Queue) Commit(msg *kafka.Message) {
	start := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), KafkaOperationTimeout)
	defer cancel()
	err := p.kafkaC.CommitMessages(ctx, *msg)
	if err != nil {
		log.Error(errors.Wrap(err, "failed to commit message"))
	} else {
		hlog.Incr("worker.kafka.commitMessageCount", nil, 1)
		hlog.Histogram("worker.kafka.commitSec", time.Since(start).Seconds(), nil, 1)
	}
}

func (p *Queue) LogStats() {
	if p.kafkaP != nil {
		stats := p.kafkaP.Stats()
		log.Debugf("Kafka Producer Stats: count %d. batchAvg %s. writeAvg %s. waitAvg %s", stats.Messages, stats.BatchTime.Avg, stats.WriteTime.Avg, stats.WaitTime.Avg)

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
		log.Debugf("Kafka Consumer Stats: count %d. readAvg %s. waitAvg %s", stats.Messages, stats.ReadTime.Avg, stats.WaitTime.Avg)

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

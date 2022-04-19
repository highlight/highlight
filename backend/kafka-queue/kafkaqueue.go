package kafka_queue

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"github.com/DmitriyVTitov/size"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/pkg/errors"
	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/scram"
	log "github.com/sirupsen/logrus"
	"os"
	"strconv"
	"strings"
	"time"
)

// KafkaOperationTimeout How long to wait for Kafka operations before polling again.
const KafkaOperationTimeout = 15 * time.Second

const (
	prefetchSizeBytes = 8 * 1000 * 1000   // 8 MB
	messageSizeBytes  = 500 * 1000 * 1000 // 500 MB
)

type Mode int

const (
	Producer Mode = iota
	Consumer Mode = iota
)

type Queue struct {
	Topic string

	client *kafka.Client
	kafkaP *kafka.Writer
	kafkaC *kafka.Reader

	numSubmitted int64
	numReceived  int64

	submitTime  []time.Duration
	receiveTime []time.Duration
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
	mechanism, err := scram.Mechanism(scram.SHA512, os.Getenv("KAFKA_SASL_USERNAME"), os.Getenv("KAFKA_SASL_PASSWORD"))
	if err != nil {
		log.Fatal(errors.Wrap(err, "failed to authenticate with kafka"))
	}

	tlsConfig := &tls.Config{}
	pool := &Queue{Topic: topic, client: &kafka.Client{
		Addr: kafka.TCP(brokers[0]),
		Transport: &kafka.Transport{
			SASL: mechanism,
			TLS:  tlsConfig,
		},
		Timeout: KafkaOperationTimeout,
	}}

	_, err = pool.client.AlterConfigs(context.Background(), &kafka.AlterConfigsRequest{
		Resources: []kafka.AlterConfigRequestResource{{
			ResourceType: kafka.ResourceTypeTopic,
			ResourceName: topic,
			Configs: []kafka.AlterConfigRequestConfig{{
				Name:  "max.message.bytes",
				Value: strconv.Itoa(messageSizeBytes),
			},
			},
		}},
	})
	if err != nil {
		log.Fatal(errors.Wrap(err, "failed to set topic message max bytes"))
	}

	if mode == Producer {
		pool.kafkaP = &kafka.Writer{
			Addr: kafka.TCP(brokers[0]),
			Transport: &kafka.Transport{
				SASL: mechanism,
				TLS:  tlsConfig,
			},
			Topic:        topic,
			Balancer:     &kafka.Hash{},
			RequiredAcks: kafka.RequireOne,
			Compression:  kafka.Zstd,
			// synchronous mode so that we can ensure messages are sent before we return
			Async: false,
			// override batch limit to be our message max size
			BatchBytes: messageSizeBytes,
			BatchSize:  1000,
			// low timeout because we don't want to block WriteMessage calls since we are sync mode
			BatchTimeout: 10 * time.Millisecond,
			MaxAttempts:  10,
		}
	} else if mode == Consumer {
		pool.kafkaC = kafka.NewReader(kafka.ReaderConfig{
			Brokers: brokers,
			Dialer: &kafka.Dialer{
				Timeout:       KafkaOperationTimeout,
				DualStack:     true,
				SASLMechanism: mechanism,
				TLS:           tlsConfig,
			},
			Topic:         topic,
			GroupID:       "group-default", // all partitions for this group, auto balanced
			MinBytes:      prefetchSizeBytes,
			MaxBytes:      messageSizeBytes,
			QueueCapacity: 1000,
			// in the future, we would commit only on successful processing of a message.
			// this means we commit very often to avoid repeating tasks on worker restart.
			CommitInterval: 100 * time.Millisecond,
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
	}
}

func (p *Queue) Submit(msg *Message, partitionKey string) {
	start := time.Now()
	msgBytes, err := p.serializeMessage(msg)
	if err != nil {
		log.Error(errors.Wrap(err, "failed to serialize message"))
	}
	err = p.kafkaP.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(partitionKey),
			Value: msgBytes,
		},
	)
	if err != nil {
		log.Errorf("failed to send message, size %d, err %s", size.Of(msgBytes), err.Error())
	}

	p.numSubmitted += 1
	p.submitTime = append(p.submitTime, time.Since(start))
}

func (p *Queue) Receive() (msg *Message) {
	start := time.Now()
	m, err := p.kafkaC.ReadMessage(context.Background())
	if err != nil {
		log.Error(errors.Wrap(err, "failed to deserialize message"))
		return nil
	}
	msgBytes := m.Value
	msg, err = p.deserializeMessage(msgBytes)
	if err != nil {
		log.Error(errors.Wrap(err, "failed to deserialize message"))
		return nil
	}
	p.numReceived += 1
	p.receiveTime = append(p.receiveTime, time.Since(start))
	return
}

func (p *Queue) LogStats() {
	if p.kafkaP != nil {
		avgSubmit := time.Duration(0)
		if p.numSubmitted > 0 {
			for _, t := range p.submitTime {
				avgSubmit += t
				hlog.Histogram("worker.kafka.produceMessageSec", t.Seconds(), nil, 1)
			}
			avgSubmit = time.Duration(avgSubmit.Nanoseconds() / p.numSubmitted)
		}
		log.Debugf("Kafka Producer Stats: %d submitted. avg %s", p.numSubmitted, avgSubmit)

		hlog.Gauge("worker.kafka.produceMessageCount", float64(p.numSubmitted), nil, 1)
		hlog.Gauge("worker.kafka.produceMessageAvgSec", avgSubmit.Seconds(), nil, 1)
		stats := p.kafkaP.Stats()
		hlog.Gauge("worker.kafka.produceBatchAvgSec", stats.BatchTime.Avg.Seconds(), nil, 1)
		hlog.Gauge("worker.kafka.produceWriteAvgSec", stats.WriteTime.Avg.Seconds(), nil, 1)
		hlog.Gauge("worker.kafka.produceWaitAvgSec", stats.WaitTime.Avg.Seconds(), nil, 1)

		p.submitTime = []time.Duration{}
		p.numSubmitted = 0
	}
	if p.kafkaC != nil {
		avgReceive := time.Duration(0)
		if p.numReceived > 0 {
			for _, t := range p.receiveTime {
				avgReceive += t
				hlog.Histogram("worker.kafka.consumeMessageSec", t.Seconds(), nil, 1)
			}
			avgReceive = time.Duration(avgReceive.Nanoseconds() / p.numReceived)
		}
		log.Debugf("Kafka Consumer Stats: %d received.  avg %s", p.numReceived, avgReceive)

		hlog.Gauge("worker.kafka.consumeMessageCount", float64(p.numReceived), nil, 1)
		hlog.Gauge("worker.kafka.consumeMessageAvgSec", avgReceive.Seconds(), nil, 1)
		stats := p.kafkaC.Stats()
		hlog.Gauge("worker.kafka.consumeReadAvgSec", stats.ReadTime.Avg.Seconds(), nil, 1)
		hlog.Gauge("worker.kafka.consumeWaitAvgSec", stats.WaitTime.Avg.Seconds(), nil, 1)

		p.receiveTime = []time.Duration{}
		p.numReceived = 0
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

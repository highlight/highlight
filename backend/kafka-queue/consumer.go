package kafka_queue

import (
	"bytes"
	"encoding/json"
	"github.com/andybalholm/brotli"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"io"
	"os"
	"sync"
	"time"
)

// ConsumerWorkers Number of kafka Consumer workers.
const ConsumerWorkers = 8

func MakeConsumer() (*kafka.Consumer, error) {
	kafkaC, err := kafka.NewConsumer(&kafka.ConfigMap{
		"sasl.mechanism":                  "SCRAM-SHA-512",
		"security.protocol":               "sasl_ssl",
		"bootstrap.servers":               os.Getenv("KAFKA_SERVERS"),
		"sasl.username":                   os.Getenv("KAFKA_SASL_USERNAME"),
		"sasl.password":                   os.Getenv("KAFKA_SASL_PASSWORD"),
		"group.id":                        "group-default",
		"auto.offset.reset":               "smallest",
		"go.application.rebalance.enable": true,
		"queued.min.messages":             WorkerPrefetch * ConsumerWorkers,
		"statistics.interval.ms":          5000,
		"fetch.message.max.bytes":         prefetchSizeBytes,
		"message.max.bytes":               messageSizeBytes,
		"receive.message.max.bytes":       messageSizeBytes + 1*1024*1024,
	})
	return kafkaC, err
}

type queueConsumer struct {
	run    *bool
	kafkaC *kafka.Consumer

	buff     bytes.Buffer
	brReader brotli.Reader

	consumerQueue chan *Message

	numConsumed          int
	consumerQueueBlocked time.Duration
	consumerLoopTime     time.Duration

	consumerWg *sync.WaitGroup
}

func (p *queueConsumer) runConsumer() {
	for *p.run {
		loopStart := time.Now()
		var err error
		ev := p.kafkaC.Poll(KafkaOperationTimeoutMs)
		switch e := ev.(type) {
		case kafka.AssignedPartitions:
			log.Infof("Assigned Partition %v", e)
			err = p.kafkaC.Assign(e.Partitions)
		case kafka.RevokedPartitions:
			log.Infof("Revoked Partition %v", e)
			err = p.kafkaC.Unassign()
		case *kafka.Message:
			var msg *Message
			msg, err = p.deserializeMessage(e.Value)
			if err != nil {
				log.Errorf("error deserializing msg %v", err)
				continue
			}
			start := time.Now()
			p.consumerQueue <- msg
			p.numConsumed += 1
			p.consumerQueueBlocked += time.Since(start)
		case kafka.PartitionEOF:
			log.Infof("Reached %v", e)
		case kafka.Error:
			log.Errorf("Error: %v", e)
			time.Sleep(time.Second)
		case *kafka.Stats:
			var stats map[string]interface{}
			_ = json.Unmarshal([]byte(e.String()), &stats)
			log.Infof("Kafka Consumer librdkafka Stats: rxmsgs %+v, rxmsg_bytes %+v, replyq %+v", stats["rxmsgs"], stats["rxmsg_bytes"], stats["replyq"])
		}
		if err != nil {
			log.Errorf("Kafka consumer encountered error %v", err)
			err = nil
		}
		p.consumerLoopTime += time.Since(loopStart)
	}
	p.consumerWg.Done()
}

func (p *queueConsumer) deserializeMessage(compressed []byte) (*Message, error) {
	p.buff.Reset()
	_ = p.brReader.Reset(&p.buff)

	if _, err := p.buff.Write(compressed); err != nil {
		return nil, errors.Wrap(err, "failed to write compressed buffer")
	}

	out := new(bytes.Buffer)
	if _, err := io.Copy(out, &p.brReader); err != nil {
		return nil, errors.Wrap(err, "failed to read decompressed from reader")
	}

	var msg Message
	if err := json.Unmarshal(out.Bytes(), &msg); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshall decompressed msg")
	}

	return &msg, nil
}

func (p *Queue) rebalance(c *kafka.Consumer, event kafka.Event) (err error) {
	switch e := event.(type) {
	case kafka.AssignedPartitions:
		log.Infof("Assigned Partition %v", e)
		err = c.Assign(e.Partitions)
	case kafka.RevokedPartitions:
		log.Infof("Revoked Partition %v", e)
		err = c.Unassign()
	case nil:
	default:
		log.Infof("Ignored %v", e)
	}

	if err != nil {
		log.Errorf("Kafka consumer encountered error on rebalance %v", err)
	}
	return
}

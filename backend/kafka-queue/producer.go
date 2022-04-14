package kafka_queue

import (
	"bytes"
	"encoding/json"
	"github.com/andybalholm/brotli"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"os"
	"sync"
)

// ProducerWorkers Number of kafka Producer workers.
const ProducerWorkers = 8

func MakeProducer() (*kafka.Producer, error) {
	kafkaProducerID, err := os.Hostname()
	if err != nil {
		kafkaProducerID = "public-unknown"
	}

	kafkaP, err := kafka.NewProducer(&kafka.ConfigMap{
		"sasl.mechanism":         "SCRAM-SHA-512",
		"security.protocol":      "sasl_ssl",
		"bootstrap.servers":      os.Getenv("KAFKA_SERVERS"),
		"sasl.username":          os.Getenv("KAFKA_SASL_USERNAME"),
		"sasl.password":          os.Getenv("KAFKA_SASL_PASSWORD"),
		"client.id":              kafkaProducerID,
		"message.max.bytes":      messageSizeBytes,
		"queue.buffering.max.ms": 100,
		"acks":                   1})
	return kafkaP, err
}

type queueProducer struct {
	kafkaP *kafka.Producer
	topic  string
	run    *bool

	buff     bytes.Buffer
	brWriter brotli.Writer

	producerQueue chan *PartitionMessage

	numDelivered int
	producerWg   *sync.WaitGroup
}

func (p *queueProducer) runProducer() {
	go func() {
		for e := range p.kafkaP.Events() {
			if !*p.run && p.kafkaP.Len() == 0 {
				break
			}
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					log.Errorf("Failed to deliver message: %v", ev.TopicPartition)
				} else {
					p.numDelivered += 1
				}
			}
		}
	}()
	for {
		partitionMessage := <-p.producerQueue
		// channel is closed via the Stop() operation
		if partitionMessage == nil {
			break
		}
		msg, err := p.serializeMessage(partitionMessage.Message)
		if err != nil {
			log.Errorf("an error occured while adding message to producer queue %+v", err)
		}
		err = p.kafkaP.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &p.topic, Partition: partitionMessage.Partition},
			Value:          []byte(msg)}, nil,
		)
		if err != nil {
			log.Errorf("an error occured while adding message to producer queue %+v", err)
		}
	}
	p.producerWg.Done()
}

func (p *queueProducer) serializeMessage(msg *Message) (compressed []byte, err error) {
	b, err := json.Marshal(&msg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshall json")
	}

	p.buff.Reset()
	p.brWriter.Reset(&p.buff)
	if _, err = p.brWriter.Write(b); err != nil {
		return nil, errors.Wrap(err, "failed to write to brotli writer")
	}
	if err = p.brWriter.Flush(); err != nil {
		return nil, errors.Wrap(err, "failed to flush brotli writer")
	}

	return p.buff.Bytes(), nil
}

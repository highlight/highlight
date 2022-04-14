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

// LocalConsumerPrefetch Number of Messages to retrieve per worker (populating local consumerQueue)
const LocalConsumerPrefetch = 1024

// ConsumerWorkers Number of kafka Consumer workers.
const ConsumerWorkers = 8

// KafkaOperationTimeoutMs How long to wait for Kafka operations before polling again.
const KafkaOperationTimeoutMs = 15 * 1000

const (
	prefetchSizeBytes = 8 * 1024 * 1024
	messageSizeBytes  = 512 * 1024 * 1024
)

type Queue struct {
	topic         string
	producerQueue chan *PartitionMessage
	consumerQueue chan *Message
	workers       int
	partitions    int
	run           bool

	kafkaP *kafka.Producer
	kafkaC *kafka.Consumer

	producers  []queueProducer
	producerWg sync.WaitGroup
	consumers  []queueConsumer
	consumerWg sync.WaitGroup

	numSubmitted int64
	numReceived  int64
}

type MessageQueue interface {
	Stop()
	Receive() *Message
	Submit(*Message, int)
	LogStats()
}

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
		"queued.min.messages":             LocalConsumerPrefetch * ConsumerWorkers,
		"statistics.interval.ms":          5000,
		"fetch.message.max.bytes":         prefetchSizeBytes,
		"message.max.bytes":               messageSizeBytes,
		"receive.message.max.bytes":       messageSizeBytes + 1*1024*1024,
	})
	return kafkaC, err
}

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

func New(topic string, producer *kafka.Producer, consumer *kafka.Consumer) *Queue {
	pool := &Queue{
		topic:   topic,
		workers: ConsumerWorkers,
		run:     true,
		kafkaP:  producer,
		kafkaC:  consumer,
	}

	var metadata *kafka.Metadata
	if consumer != nil {
		err := consumer.Subscribe(topic, pool.rebalance)
		if err != nil {
			log.Fatalf("error subscribing consumer to topic %v: %v", topic, err)
		}

		metadata, err = consumer.GetMetadata(&pool.topic, false, KafkaOperationTimeoutMs)
		if err != nil {
			log.Fatalf("error getting consumer metadata for topic %v: %v", topic, err)
		}
	} else if producer != nil {
		var err error
		metadata, err = producer.GetMetadata(&pool.topic, false, KafkaOperationTimeoutMs)
		if err != nil {
			log.Fatalf("error getting producer metadata for topic %v: %v", topic, err)
		}
	}
	pool.partitions = len(metadata.Topics[pool.topic].Partitions)
	log.Infof("established kafka topic %s with %d partitions", pool.topic, pool.partitions)

	if consumer != nil {
		pool.consumerQueue = make(chan *Message, pool.workers*LocalConsumerPrefetch)
		pool.consumerWg.Add(pool.workers)
		pool.consumers = make([]queueConsumer, pool.workers)
		for i := 0; i < pool.workers; i++ {
			pool.consumers[i] = queueConsumer{
				run:           &pool.run,
				kafkaC:        pool.kafkaC,
				consumerQueue: pool.consumerQueue,
				consumerWg:    &pool.consumerWg,
			}
			go pool.consumers[i].runConsumer()
		}
	}
	if producer != nil {
		pool.producerQueue = make(chan *PartitionMessage, pool.workers*LocalConsumerPrefetch)
		pool.producerWg.Add(pool.workers)
		pool.producers = make([]queueProducer, pool.workers)
		for i := 0; i < pool.workers; i++ {
			pool.producers[i] = queueProducer{
				topic:         pool.topic,
				kafkaP:        pool.kafkaP,
				run:           &pool.run,
				producerQueue: pool.producerQueue,
				producerWg:    &pool.producerWg,
			}
			go pool.producers[i].runProducer()
		}
	}
	go func() {
		for pool.run {
			pool.LogStats()
			time.Sleep(5 * time.Second)
		}
	}()

	return pool
}

func (p *Queue) Stop() {
	if p.kafkaC != nil {
		p.run = false
		p.consumerWg.Wait()
		_ = p.kafkaC.Close()
	}
	if p.kafkaP != nil {
		p.kafkaP.Flush(KafkaOperationTimeoutMs)
		p.run = false
		close(p.producerQueue)
		p.producerWg.Wait()
		p.kafkaP.Close()
	}
}

func (p *Queue) Submit(msg *Message, partitionKey int) {
	var partition int32
	if partitionKey == 0 {
		partition = kafka.PartitionAny
	} else {
		partition = int32(partitionKey % p.partitions)
	}
	p.producerQueue <- &PartitionMessage{
		Message:   msg,
		Partition: partition,
	}

	p.numSubmitted += 1
}

func (p *Queue) Receive() (msg *Message) {
	msg = <-p.consumerQueue
	p.numReceived += 1
	return
}

func (p *Queue) LogStats() {
	if p.kafkaP != nil {
		numDelivered := 0
		for _, producer := range p.producers {
			numDelivered += producer.numDelivered
		}
		log.Infof("Kafka Producer Stats: %d submitted, %d delivered", p.numSubmitted, numDelivered)
	}
	if p.kafkaC != nil {
		blockPercent := 0.
		numConsumed := 0
		consumerLoopTime := time.Duration(0)
		consumerQueueBlocked := time.Duration(0)

		for _, consumer := range p.consumers {
			numConsumed += consumer.numConsumed
			consumerLoopTime += consumer.consumerLoopTime
			consumerQueueBlocked += consumer.consumerQueueBlocked
			consumer.consumerLoopTime = time.Duration(0)
			consumer.consumerQueueBlocked = time.Duration(0)
		}
		if consumerLoopTime > 0 {
			blockPercent = 100. * float64(consumerQueueBlocked.Nanoseconds()) / float64(consumerLoopTime.Nanoseconds())
		}
		log.Infof("Kafka Consumer Stats: %d consumed, %d received, %s consumer blocked, %.2f%% of loop", numConsumed, p.numReceived, consumerQueueBlocked, blockPercent)
	}
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

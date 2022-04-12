package kafka_queue

import (
	"bytes"
	"encoding/json"
	"github.com/andybalholm/brotli"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	log "github.com/sirupsen/logrus"
	"io"
	"sync"
	"time"
)

// LocalConsumerPrefetch Number of Messages to retrieve per worker (populating local consumerQueue)
const LocalConsumerPrefetch = 16

// LocalProducerBuffer Number of Messages that can be queued up for producing before Submit blocks.
const LocalProducerBuffer = 10000
const KafkaOperationTimeoutMs = 15 * 1000

// ConsumerWorkers Number of kafka Consumer workers. Recommended = # of goroutines calling `Receive()`
const ConsumerWorkers = 1

type Queue struct {
	topic         string
	consumerQueue chan Message
	workers       int
	partitions    int
	run           bool

	kafkaP *kafka.Producer
	kafkaC *kafka.Consumer

	producerWg sync.WaitGroup
	consumerWg sync.WaitGroup

	numSubmitted int64
	numDelivered int64

	numReceived int64
	numConsumed int64

	consumerQueueBlocked time.Duration
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
	var err error
	if consumer != nil {
		err := consumer.Subscribe(topic, pool.rebalance)
		if err != nil {
			log.Fatalf("error subscribing consumer to topic %v: %v", topic, err)
		}

		metadata, err = consumer.GetMetadata(&pool.topic, false, KafkaOperationTimeoutMs)
	} else if producer != nil {
		metadata, err = producer.GetMetadata(&pool.topic, false, KafkaOperationTimeoutMs)
	}
	if err != nil {
		log.Fatalf("error getting consumer metadata for topic %v: %v", topic, err)
	}
	pool.partitions = len(metadata.Topics[pool.topic].Partitions)
	log.Infof("established kafka topic %s with %d partitions", pool.topic, pool.partitions)

	if consumer != nil {
		pool.consumerQueue = make(chan Message, pool.workers*LocalConsumerPrefetch)
		pool.consumerWg.Add(pool.workers)
		for i := 0; i < pool.workers; i++ {
			go pool.runConsumer()
		}
	}
	if producer != nil {
		pool.producerWg.Add(1)
		go pool.runProducer()
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
	p.run = false
	if p.kafkaC != nil {
		p.producerWg.Wait()
		_ = p.kafkaC.Close()
	}
	if p.kafkaP != nil {
		p.consumerWg.Wait()
		p.kafkaP.Close()
	}
}

func (p *Queue) Submit(task Message, partitionKey int) {
	var partition int32
	if partitionKey == 0 {
		partition = kafka.PartitionAny
	} else {
		partition = int32(partitionKey % p.partitions)
	}
	msg := p.serializeTask(task)
	err := p.kafkaP.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &p.topic, Partition: partition},
		Value:          []byte(msg)}, nil,
	)
	if err != nil {
		log.Errorf("an error occured while adding message to producer queue %+v", err)
	}
	p.numSubmitted += 1
}

func (p *Queue) Receive() (task Message) {
	task = <-p.consumerQueue
	p.numReceived += 1
	return
}

func (p *Queue) LogStats() {
	if p.kafkaP != nil {
		log.Infof("Kafka Producer Stats: %d submitted, %d delivered", p.numSubmitted, p.numDelivered)
	} else {
		log.Infof("Kafka Consumer Stats: %d consumed, %d received, %s consumer blocked", p.numConsumed, p.numReceived, p.consumerQueueBlocked)
	}
}

func (p *Queue) rebalance(c *kafka.Consumer, event kafka.Event) (err error) {
	switch e := event.(type) {
	case kafka.AssignedPartitions:
		log.Infof("Assigned Partition %v", e)
		err = p.kafkaC.Assign(e.Partitions)
	case kafka.RevokedPartitions:
		log.Infof("Revoked Partition %v", e)
		err = p.kafkaC.Unassign()
	case nil:
	default:
		log.Infof("Ignored %v", e)
	}

	if err != nil {
		log.Errorf("Kafka consumer encountered error %v", err)
	}
	return
}

func (p *Queue) runProducer() {
	for e := range p.kafkaP.Events() {
		if !p.run {
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
	p.producerWg.Done()
}

func (p *Queue) runConsumer() {
	for p.run {
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
			task := p.deserializeTask(e.Value)
			start := time.Now()
			p.consumerQueue <- task
			p.numConsumed += 1
			p.consumerQueueBlocked += time.Now().Sub(start)
		case kafka.PartitionEOF:
			log.Infof("Reached %v", e)
		case kafka.Error:
			log.Errorf("Error: %v", e)
			time.Sleep(time.Second)
		}
		if err != nil {
			log.Errorf("Kafka consumer encountered error %v", err)
			err = nil
		}
	}
	p.consumerWg.Done()
}

func (p *Queue) serializeTask(task Message) (compressed []byte) {
	b, err := json.Marshal(&task)
	if err != nil {
		log.Errorf("error serializing task %v", err)
	}

	in := bytes.NewReader(b)
	out := new(bytes.Buffer)
	brWriter := brotli.NewWriterLevel(out, 9)
	if _, err = io.Copy(brWriter, in); err != nil {
		log.Errorf("error compressing task %v", err)
	}
	if err = brWriter.Close(); err != nil {
		log.Errorf("error compressing task %v", err)
	}

	compressed = out.Bytes()
	return
}

func (p *Queue) deserializeTask(compressed []byte) (task Message) {
	in := bytes.NewReader(compressed)
	out := new(bytes.Buffer)
	brReader := brotli.NewReader(in)

	if _, err := io.Copy(out, brReader); err != nil {
		log.Errorf("error decompressing task %v", err)
	}

	err := json.Unmarshal(out.Bytes(), &task)
	if err != nil {
		log.Errorf("error deserializing task %v", err)
	}

	return
}

package kafka_queue

import (
	"bytes"
	"encoding/json"
	"github.com/DmitriyVTitov/size"
	"github.com/andybalholm/brotli"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	log "github.com/sirupsen/logrus"
	"io"
	"sync"
	"time"
)

const Partitions = 64

type Queue struct {
	topic         string
	producerQueue chan kafka.Event
	consumerQueue chan Message
	workers       int
	run           bool

	kafkaP *kafka.Producer
	kafkaC *kafka.Consumer

	producerWg sync.WaitGroup
	consumerWg sync.WaitGroup
}

func New(topic string, producer *kafka.Producer, consumer *kafka.Consumer, workers int) *Queue {
	// There must be at least one worker.
	if workers < 1 {
		workers = 1
	}

	pool := &Queue{
		topic:         topic,
		workers:       workers,
		run:           true,
		producerQueue: make(chan kafka.Event, 10000),
		consumerQueue: make(chan Message, 10000),
		kafkaP:        producer,
		kafkaC:        consumer,
	}

	if consumer != nil {
		err := consumer.Subscribe(topic, pool.rebalance)
		if err != nil {
			log.Fatalf("error subscribing consumer to topic %v: %v", topic, err)
		}
		pool.consumerWg.Add(workers)
		for i := 0; i < workers; i++ {
			go pool.runConsumer()
		}
	}
	if producer != nil {
		pool.producerWg.Add(workers)
		for i := 0; i < workers; i++ {
			go pool.runProducer()
		}
	}

	return pool
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
		partition = int32(partitionKey % Partitions)
	}
	msg := p.serializeTask(task)
	err := p.kafkaP.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &p.topic, Partition: partition},
		Value:          []byte(msg)},
		p.producerQueue,
	)
	if err != nil {
		log.Errorf("an error occured while adding message to producer queue %+v", err)
	}
}

func (p *Queue) Receive() (task Message) {
	task = <-p.consumerQueue
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
			}
		}
	}
	p.producerWg.Done()
}

func (p *Queue) runConsumer() {
	for p.run {
		var err error
		ev := p.kafkaC.Poll(1000)
		switch e := ev.(type) {
		case kafka.AssignedPartitions:
			log.Infof("Assigned Partition %v", e)
			err = p.kafkaC.Assign(e.Partitions)
		case kafka.RevokedPartitions:
			log.Infof("Revoked Partition %v", e)
			err = p.kafkaC.Unassign()
		case *kafka.Message:
			task := p.deserializeTask(e.Value)
			p.consumerQueue <- task
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
	log.Warnf("serialized task %v to %v", size.Of(task), size.Of(compressed))

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

	log.Warnf("deserialized task %v to %v", size.Of(compressed), size.Of(task))
	return
}

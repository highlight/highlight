package kafka_queue

import (
	"encoding/json"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	log "github.com/sirupsen/logrus"
	"sync"
	"time"
)

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

func (p *Queue) Submit(task Message) {
	msg := p.serializeTask(task)
	err := p.kafkaP.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &p.topic, Partition: kafka.PartitionAny},
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

func (p *Queue) serializeTask(task Message) []byte {
	// TODO(vkorolik) compress task body
	b, err := json.Marshal(&task)
	if err != nil {
		log.Errorf("error serializing task %v", err)
	}
	return b
}

func (p *Queue) deserializeTask(data []byte) (task Message) {
	// TODO(vkorolik) decompress task body
	err := json.Unmarshal(data, &task)
	if err != nil {
		log.Errorf("error deserializing task %v", err)
	}
	return
}

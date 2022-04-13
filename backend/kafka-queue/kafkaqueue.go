package kafka_queue

import (
	"bytes"
	"encoding/json"
	"github.com/andybalholm/brotli"
	"github.com/confluentinc/confluent-kafka-go/kafka"
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
	consumerQueue chan *Message
	workers       int
	partitions    int
	run           bool

	kafkaP *kafka.Producer
	kafkaC *kafka.Consumer

	producerWg sync.WaitGroup
	consumerWg sync.WaitGroup

	producerStatMutex sync.Mutex
	numSubmitted      int64
	numDelivered      int64

	consumerStatMutex    sync.Mutex
	numReceived          int64
	numConsumed          int64
	consumerLoopTime     time.Duration
	consumerQueueBlocked time.Duration
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
	if p.kafkaC != nil {
		p.run = false
		p.producerWg.Wait()
		_ = p.kafkaC.Close()
	}
	if p.kafkaP != nil {
		p.kafkaP.Flush(KafkaOperationTimeoutMs)
		p.run = false
		p.consumerWg.Wait()
		p.kafkaP.Close()
	}
}

func (p *Queue) Submit(task *Message, partitionKey int) {
	var partition int32
	if partitionKey == 0 {
		partition = kafka.PartitionAny
	} else {
		partition = int32(partitionKey % p.partitions)
	}
	msg, err := p.serializeTask(task)
	if err != nil {
		log.Errorf("an error occured while adding message to producer queue %+v", err)
		return
	}
	err = p.kafkaP.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &p.topic, Partition: partition},
		Value:          []byte(msg)}, nil,
	)
	if err != nil {
		log.Errorf("an error occured while adding message to producer queue %+v", err)
		return
	}
	p.producerStatMutex.Lock()
	p.numSubmitted += 1
	p.producerStatMutex.Unlock()
}

func (p *Queue) Receive() (task *Message) {
	task = <-p.consumerQueue
	p.consumerStatMutex.Lock()
	p.numReceived += 1
	p.consumerStatMutex.Unlock()
	return
}

func (p *Queue) LogStats() {
	if p.kafkaP != nil {
		log.Infof("Kafka Producer Stats: %d submitted, %d delivered", p.numSubmitted, p.numDelivered)
	} else {
		blockPercent := 0.
		if p.consumerLoopTime > 0 {
			blockPercent = 100. * float64(p.consumerQueueBlocked.Nanoseconds()) / float64(p.consumerLoopTime.Nanoseconds())
		}
		log.Infof("Kafka Consumer Stats: %d consumed, %d received, %s consumer blocked, %.2f%% of loop", p.numConsumed, p.numReceived, p.consumerQueueBlocked, blockPercent)
		p.consumerStatMutex.Lock()
		p.consumerQueueBlocked = time.Duration(0)
		p.consumerLoopTime = time.Duration(0)
		p.consumerStatMutex.Unlock()
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

func (p *Queue) runProducer() {
	for e := range p.kafkaP.Events() {
		if !p.run && p.kafkaP.Len() == 0 {
			break
		}
		switch ev := e.(type) {
		case *kafka.Message:
			if ev.TopicPartition.Error != nil {
				log.Errorf("Failed to deliver message: %v", ev.TopicPartition)
			} else {
				p.producerStatMutex.Lock()
				p.numDelivered += 1
				p.producerStatMutex.Unlock()
			}
		}
	}
	p.producerWg.Done()
}

func (p *Queue) runConsumer() {
	for p.run {
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
			var task *Message
			task, err = p.deserializeTask(e.Value)
			if err != nil {
				continue
			}
			start := time.Now()
			p.consumerQueue <- task
			p.consumerStatMutex.Lock()
			p.numConsumed += 1
			p.consumerQueueBlocked += time.Since(start)
			p.consumerStatMutex.Unlock()
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

func (p *Queue) serializeTask(task *Message) (compressed []byte, err error) {
	b, err := json.Marshal(&task)
	if err != nil {
		log.Errorf("error serializing task %v", err)
		return nil, err
	}

	in := bytes.NewReader(b)
	out := new(bytes.Buffer)
	brWriter := brotli.NewWriterLevel(out, 9)
	if _, err = io.Copy(brWriter, in); err != nil {
		log.Errorf("error compressing task %v", err)
		return nil, err
	}
	if err = brWriter.Close(); err != nil {
		log.Errorf("error compressing task %v", err)
		return nil, err
	}

	return out.Bytes(), nil
}

func (p *Queue) deserializeTask(compressed []byte) (*Message, error) {
	in := bytes.NewReader(compressed)
	out := new(bytes.Buffer)
	brReader := brotli.NewReader(in)

	if _, err := io.Copy(out, brReader); err != nil {
		log.Errorf("error decompressing task %v", err)
		return nil, err
	}

	var task Message
	err := json.Unmarshal(out.Bytes(), &task)
	if err != nil {
		log.Errorf("error deserializing task %v", err)
		return nil, err
	}

	return &task, nil
}

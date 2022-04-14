package kafka_queue

import (
	"github.com/confluentinc/confluent-kafka-go/kafka"
	log "github.com/sirupsen/logrus"
	"sync"
	"time"
)

// WorkerPrefetch Number of Messages to retrieve per worker (populating local consumerQueue)
const WorkerPrefetch = 1024

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

func New(topic string, producer *kafka.Producer, consumer *kafka.Consumer) *Queue {
	pool := &Queue{
		topic:  topic,
		run:    true,
		kafkaP: producer,
		kafkaC: consumer,
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
		pool.consumerQueue = make(chan *Message, ConsumerWorkers*WorkerPrefetch)
		pool.consumerWg.Add(ConsumerWorkers)
		pool.consumers = make([]queueConsumer, ConsumerWorkers)
		for i := 0; i < ConsumerWorkers; i++ {
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
		pool.producerQueue = make(chan *PartitionMessage, ProducerWorkers*WorkerPrefetch)
		pool.producerWg.Add(ProducerWorkers)
		pool.producers = make([]queueProducer, ProducerWorkers)
		for i := 0; i < ProducerWorkers; i++ {
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

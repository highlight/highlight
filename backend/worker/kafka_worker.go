package worker

import (
	"context"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/util"
	log "github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"time"
)

func (k *KafkaWorker) processWorkerError(task *kafkaqueue.Message, err error) {
	log.Errorf("task %+v failed: %s", *task, err)
	if task.Failures >= task.MaxRetries {
		log.Errorf("task %+v failed after %d retries", *task, task.Failures)
	} else {
		hlog.Histogram("worker.kafka.processed.taskFailures", float64(task.Failures), nil, 1)
	}
	task.Failures += 1
}

func (k *KafkaWorker) ProcessMessages() {
	for {
		func() {
			defer util.Recover()
			s := tracer.StartSpan("processPublicWorkerMessage", tracer.ResourceName("worker.kafka.process"))
			s.SetTag("worker.goroutine", k.WorkerThread)
			defer s.Finish()

			s1 := tracer.StartSpan("worker.kafka.receiveMessage", tracer.ChildOf(s.Context()))
			task := k.KafkaQueue.Receive()
			s1.Finish()

			if task == nil {
				return
			}
			s.SetTag("taskType", task.Type)
			s.SetTag("partition", task.KafkaMessage.Partition)
			s.SetTag("partitionKey", string(task.KafkaMessage.Key))

			var err error
			s2 := tracer.StartSpan("worker.kafka.processMessage", tracer.ChildOf(s.Context()))
			for i := 0; i <= task.MaxRetries; i++ {
				if err = k.Worker.processPublicWorkerMessage(tracer.ContextWithSpan(context.Background(), s), task); err != nil {
					k.processWorkerError(task, err)
					s.SetTag("taskFailures", task.Failures)
				} else {
					break
				}
			}
			s2.Finish(tracer.WithError(err))

			s3 := tracer.StartSpan("worker.kafka.commitMessage", tracer.ChildOf(s.Context()))
			k.KafkaQueue.Commit(task.KafkaMessage)
			s3.Finish()

			hlog.Incr("worker.kafka.processed.total", nil, 1)
		}()
	}
}

const BatchFlushSize = 1000
const BatchedFlushTimeout = 5 * time.Second

type KafkaWorker struct {
	KafkaQueue   *kafkaqueue.Queue
	Worker       *Worker
	WorkerThread int
}

func (k *KafkaBatchWorker) flush(ctx context.Context) {
	s, _ := tracer.StartSpanFromContext(ctx, "kafkaWorker", tracer.ResourceName("worker.kafka.batched.flush"))
	s.SetTag("BatchSize", k.messageQueue)
	defer s.Finish()

	var logRows []*clickhouse.LogRow

	for _, msg := range k.messageQueue {
		switch msg.Type {
		case kafkaqueue.PushLogs:
			logRows = append(logRows, msg.PushLogs.LogRows...)
		}
	}

	err := k.Worker.PublicResolver.Clickhouse.BatchWriteLogRows(ctx, logRows)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to batch write to clickhouse")
	}

	k.KafkaQueue.Commit(k.messageQueue[len(k.messageQueue)-1].KafkaMessage)
	k.messageQueue = []*kafkaqueue.Message{}
}

func (k *KafkaBatchWorker) ProcessMessages() {
	for {
		func() {
			defer util.Recover()
			s, ctx := tracer.StartSpanFromContext(context.Background(), "kafkaWorker", tracer.ResourceName("worker.kafka.batched.process"))
			s.SetTag("worker.goroutine", k.WorkerThread)
			defer s.Finish()

			if len(k.messageQueue) > 0 {
				oldest := k.messageQueue[0]
				if time.Since(oldest.KafkaMessage.Time) > BatchedFlushTimeout {
					k.flush(ctx)
				}
			}

			s1, _ := tracer.StartSpanFromContext(ctx, "kafkaWorker", tracer.ResourceName("worker.kafka.batched.receive"))
			task := k.KafkaQueue.Receive()
			s1.Finish()
			if task == nil {
				return
			}

			k.messageQueue = append(k.messageQueue, task)
			if len(k.messageQueue) >= BatchFlushSize {
				k.flush(ctx)
			}
		}()
	}
}

type KafkaBatchWorker struct {
	KafkaQueue   *kafkaqueue.Queue
	Worker       *Worker
	WorkerThread int

	// does not need to be atomic as each goroutine is a KafkaBatchWorker and this buffer is not shared
	messageQueue []*kafkaqueue.Message
}

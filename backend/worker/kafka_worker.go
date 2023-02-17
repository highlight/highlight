package worker

import (
	"context"
	"github.com/openlyinc/pointy"
	"sync"
	"time"

	"encoding/binary"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/util"
	log "github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

func (k *KafkaWorker) processWorkerError(ctx context.Context, task *kafkaqueue.Message, err error) {
	log.WithContext(ctx).Errorf("task %+v failed: %s", *task, err)
	if task.Failures >= task.MaxRetries {
		log.WithContext(ctx).Errorf("task %+v failed after %d retries", *task, task.Failures)
	} else {
		hlog.Histogram("worker.kafka.processed.taskFailures", float64(task.Failures), nil, 1)
	}
	task.Failures += 1
}

func (k *KafkaWorker) ProcessMessages(ctx context.Context) {
	for {
		func() {
			defer util.Recover()
			s := tracer.StartSpan("processPublicWorkerMessage", tracer.ResourceName("worker.kafka.process"))
			s.SetTag("worker.goroutine", k.WorkerThread)
			defer s.Finish()

			s1 := tracer.StartSpan("worker.kafka.receiveMessage", tracer.ChildOf(s.Context()))
			task := k.KafkaQueue.Receive(ctx)
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
				if err = k.Worker.processPublicWorkerMessage(tracer.ContextWithSpan(ctx, s), task); err != nil {
					k.processWorkerError(ctx, task, err)
					s.SetTag("taskFailures", task.Failures)
				} else {
					break
				}
			}
			s2.Finish(tracer.WithError(err))

			s3 := tracer.StartSpan("worker.kafka.commitMessage", tracer.ChildOf(s.Context()))
			k.KafkaQueue.Commit(ctx, task.KafkaMessage)
			s3.Finish()

			hlog.Incr("worker.kafka.processed.total", nil, 1)
		}()
	}
}

const BatchFlushSize = 128
const BatchedFlushTimeout = 1 * time.Second

type KafkaWorker struct {
	KafkaQueue   *kafkaqueue.Queue
	Worker       *Worker
	WorkerThread int
}

func (k *KafkaBatchWorker) flush(ctx context.Context) {
	s, _ := tracer.StartSpanFromContext(ctx, "kafkaWorker", tracer.ResourceName("worker.kafka.batched.flush"))
	s.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
	defer s.Finish()

	var logRows []*clickhouse.LogRow
	setupProjectIDs := make(map[int]bool)
	setupSessionIDs := make(map[string]bool)

	var received int
	var lastMsg *kafkaqueue.Message
	func() {
		for {
			select {
			case lastMsg = <-k.BatchBuffer.messageQueue:
				switch lastMsg.Type {
				case kafkaqueue.PushLogs:
					logRows = append(logRows, lastMsg.PushLogs.LogRows...)
				case kafkaqueue.MarkBackendSetup:
					if lastMsg.MarkBackendSetup.ProjectID != 0 {
						setupProjectIDs[lastMsg.MarkBackendSetup.ProjectID] = true
					} else if lastMsg.MarkBackendSetup.SessionSecureID != nil {
						setupSessionIDs[*lastMsg.MarkBackendSetup.SessionSecureID] = true
					} else {
						log.WithContext(ctx).Errorf("invalid MarkBackendSetup message %+v", lastMsg.MarkBackendSetup)
					}
				}
				received += 1
				if received >= BatchFlushSize {
					return
				}
			default:
				return
			}
		}
	}()

	s.SetTag("NumLogRows", len(logRows))
	s.SetTag("PayloadSizeBytes", binary.Size(logRows))
	if len(logRows) > 0 {
		err := k.Worker.PublicResolver.Clickhouse.BatchWriteLogRows(ctx, logRows)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to batch write to clickhouse")
		}
	}
	for projectID, _ := range setupProjectIDs {
		err := k.Worker.PublicResolver.MarkBackendSetupImpl(ctx, nil, nil, projectID)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to batch mark backend setup for project %d", projectID)
		}
	}
	for sessionID, _ := range setupSessionIDs {
		err := k.Worker.PublicResolver.MarkBackendSetupImpl(ctx, nil, pointy.String(sessionID), 0)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to batch mark backend setup for session %s", sessionID)
		}
	}

	k.KafkaQueue.Commit(ctx, lastMsg.KafkaMessage)
	k.BatchBuffer.lastMessage = nil
}

func (k *KafkaBatchWorker) ProcessMessages(ctx context.Context) {
	for {
		func() {
			defer util.Recover()
			s, ctx := tracer.StartSpanFromContext(ctx, "kafkaWorker", tracer.ResourceName("worker.kafka.batched.process"))
			s.SetTag("worker.goroutine", k.WorkerThread)
			s.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
			defer s.Finish()

			k.BatchBuffer.flushLock.Lock()
			if k.BatchBuffer.lastMessage != nil && time.Since(*k.BatchBuffer.lastMessage) > BatchedFlushTimeout {
				s.SetTag("OldestMessage", time.Since(*k.BatchBuffer.lastMessage))
				k.flush(ctx)
			}
			k.BatchBuffer.flushLock.Unlock()

			s1, _ := tracer.StartSpanFromContext(ctx, "kafkaWorker", tracer.ResourceName("worker.kafka.batched.receive"))
			task := k.KafkaQueue.Receive(ctx)
			s1.Finish()
			if task == nil {
				return
			}

			k.BatchBuffer.messageQueue <- task

			k.BatchBuffer.flushLock.Lock()
			if k.BatchBuffer.lastMessage == nil {
				t := time.Now()
				k.BatchBuffer.lastMessage = &t
			}
			if len(k.BatchBuffer.messageQueue) >= BatchFlushSize {
				k.flush(ctx)
			}
			k.BatchBuffer.flushLock.Unlock()
		}()
	}
}

type KafkaBatchWorker struct {
	KafkaQueue   *kafkaqueue.Queue
	Worker       *Worker
	WorkerThread int
	BatchBuffer  *KafkaBatchBuffer
}

type KafkaBatchBuffer struct {
	lastMessage  *time.Time
	messageQueue chan *kafkaqueue.Message
	flushLock    sync.Mutex
}

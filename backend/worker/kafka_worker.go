package worker

import (
	"context"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/util"
	log "github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"time"
)

const InitialBackoff = 10 * time.Millisecond

func (k *KafkaWorker) processWorkerError(task *kafkaqueue.Message, err error) {
	if task.Failures >= task.MaxRetries {
		log.Errorf("task %+v failed after %d retries", *task, task.Failures)
	} else {
		hlog.Histogram("worker.kafka.processed.taskFailures", float64(task.Failures), nil, 1)
		// sleep up to 10 ms * 16
		time.Sleep(InitialBackoff * (1 << task.Failures))
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

			s2 := tracer.StartSpan("worker.kafka.processMessage", tracer.ChildOf(s.Context()))
			for i := 0; i <= task.MaxRetries; i++ {
				if err := k.Worker.processPublicWorkerMessage(tracer.ContextWithSpan(context.Background(), s), task); err != nil {
					k.processWorkerError(task, err)
					s.SetTag("taskFailures", task.Failures)
				} else {
					break
				}
			}
			s2.Finish()

			s3 := tracer.StartSpan("worker.kafka.commitMessage", tracer.ChildOf(s.Context()))
			k.KafkaQueue.Commit(task.KafkaMessage)
			s3.Finish()

			hlog.Incr("worker.kafka.processed.total", nil, 1)
		}()
	}
}

type KafkaWorker struct {
	KafkaQueue   *kafkaqueue.Queue
	Worker       *Worker
	WorkerThread int
}

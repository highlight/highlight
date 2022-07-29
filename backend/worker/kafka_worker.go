package worker

import (
	"context"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

func (k *KafkaWorker) processWorkerError(task *kafkaqueue.Message, err error) {
	task.Failures += 1
	if task.Failures < task.MaxRetries {
		if err := k.KafkaQueue.Submit(task, string(task.KafkaMessage.Key)); err != nil {
			log.Error(errors.Wrap(err, "failed to resubmit message"))
		}
	} else {
		log.Errorf("task %+v failed after %d retries", *task, task.Failures)
	}
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
			if err := k.Worker.processPublicWorkerMessage(tracer.ContextWithSpan(context.Background(), s), task); err != nil {
				s2.SetTag("taskFailures", task.Failures)
				k.processWorkerError(task, err)
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

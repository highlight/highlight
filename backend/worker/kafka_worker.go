package worker

import (
	"context"
	"sync"
	"time"

	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"

	"encoding/binary"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/pricing"
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
	s, _ := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.flush"))
	s.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
	defer s.Finish()

	var logRows []*clickhouse.LogRow
	setupProjectIDs := make(map[int]map[model.MarkBackendSetupType]bool)
	setupSessionIDs := make(map[string]map[model.MarkBackendSetupType]bool)

	var received int
	var lastMsg *kafkaqueue.Message
	func() {
		for {
			select {
			case lastMsg = <-k.BatchBuffer.messageQueue:
				switch lastMsg.Type {
				case kafkaqueue.PushLogs:
					logRows = append(logRows, lastMsg.PushLogs.LogRows...)
					received += len(lastMsg.PushLogs.LogRows)
				case kafkaqueue.MarkBackendSetup:
					if lastMsg.MarkBackendSetup.ProjectID != 0 {
						if _, ok := setupProjectIDs[lastMsg.MarkBackendSetup.ProjectID]; !ok {
							setupProjectIDs[lastMsg.MarkBackendSetup.ProjectID] = make(map[model.MarkBackendSetupType]bool)
						}
						setupProjectIDs[lastMsg.MarkBackendSetup.ProjectID][lastMsg.MarkBackendSetup.Type] = true
					} else if lastMsg.MarkBackendSetup.SessionSecureID != nil {
						if _, ok := setupSessionIDs[*lastMsg.MarkBackendSetup.SessionSecureID]; !ok {
							setupSessionIDs[*lastMsg.MarkBackendSetup.SessionSecureID] = make(map[model.MarkBackendSetupType]bool)
						}
						setupSessionIDs[*lastMsg.MarkBackendSetup.SessionSecureID][lastMsg.MarkBackendSetup.Type] = true
					} else {
						log.WithContext(ctx).Errorf("invalid MarkBackendSetup message %+v", lastMsg.MarkBackendSetup)
					}
					received += 1
				}
				if received >= BatchFlushSize {
					return
				}
			default:
				return
			}
		}
	}()

	timestampByProject := map[uint32]time.Time{}
	workspaceByProject := map[uint32]*model.Workspace{}
	for _, row := range logRows {
		if row.Timestamp.After(timestampByProject[row.ProjectId]) {
			timestampByProject[row.ProjectId] = row.Timestamp
			workspaceByProject[row.ProjectId] = nil
		}
	}

	spanTs, ctxTs := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.setTimestamps"))
	for projectId, timestamp := range timestampByProject {
		err := k.Worker.Resolver.Redis.SetLastLogTimestamp(ctxTs, int(projectId), timestamp)
		if err != nil {
			log.WithContext(ctxTs).WithError(err).Errorf("failed to set last log timestamp for project %d", projectId)
		}
	}
	spanTs.Finish()

	spanW, ctxW := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.checkBillingQuotas"))

	// If it's saved in Redis that a project has exceeded / not exceeded
	// its quota, use that value. Else, add the projectId to a list of
	// projects to query.
	quotaExceededByProject := map[uint32]bool{}
	projectsToQuery := []uint32{}
	for projectId := range workspaceByProject {
		exceeded, err := k.Worker.Resolver.Redis.IsBillingQuotaExceeded(ctxW, int(projectId), pricing.ProductTypeLogs)
		if err != nil {
			log.WithContext(ctxW).Error(err)
			continue
		}
		if exceeded != nil {
			quotaExceededByProject[projectId] = *exceeded
		} else {
			projectsToQuery = append(projectsToQuery, projectId)
		}
	}

	// For any projects to query, get the associated workspace,
	// check if that workspace is within the logs quota,
	// and write the result to redis.
	for _, projectId := range projectsToQuery {
		var project model.Project
		if err := k.Worker.Resolver.DB.Model(&project).
			Where("id = ?", projectId).Find(&project).Error; err != nil {
			log.WithContext(ctxW).Error(e.Wrap(err, "error querying project"))
			continue
		}

		var workspace model.Workspace
		if err := k.Worker.Resolver.DB.Model(&workspace).
			Where("id = ?", project.WorkspaceID).Find(&workspace).Error; err != nil {
			log.WithContext(ctxW).Error(e.Wrap(err, "error querying workspace"))
			continue
		}

		projects := []model.Project{}
		if err := k.Worker.Resolver.DB.Order("name ASC").Model(&workspace).Association("Projects").Find(&projects); err != nil {
			log.WithContext(ctxW).Error(e.Wrap(err, "error querying associated projects"))
			continue
		}
		workspace.Projects = projects

		withinBillingQuota, quotaPercent := k.Worker.PublicResolver.IsWithinQuota(ctxW, pricing.ProductTypeLogs, &workspace, time.Now())
		quotaExceededByProject[projectId] = !withinBillingQuota
		if err := k.Worker.Resolver.Redis.SetBillingQuotaExceeded(ctxW, int(projectId), pricing.ProductTypeLogs, !withinBillingQuota); err != nil {
			log.WithContext(ctxW).Error(err)
		}

		// Send alert emails if above the relevant thresholds
		go func() {
			defer util.Recover()
			if quotaPercent >= 1 {
				if err := model.SendBillingNotifications(ctx, k.Worker.PublicResolver.DB, k.Worker.PublicResolver.MailClient, email.BillingLogsUsage100Percent, &workspace); err != nil {
					log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
				}
			} else if quotaPercent >= .8 {
				if err := model.SendBillingNotifications(ctx, k.Worker.PublicResolver.DB, k.Worker.PublicResolver.MailClient, email.BillingLogsUsage80Percent, &workspace); err != nil {
					log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
				}
			}
		}()
	}

	spanW.Finish()

	// Filter out any log rows for projects where the log quota has been exceeded
	var filteredRows []*clickhouse.LogRow
	for _, logRow := range logRows {
		if quotaExceededByProject[logRow.ProjectId] {
			continue
		}
		filteredRows = append(filteredRows, logRow)
	}

	wSpan, wCtx := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.process"))
	wSpan.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))

	span, ctxT := tracer.StartSpanFromContext(wCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.clickhouse"))
	span.SetTag("NumLogRows", len(logRows))
	span.SetTag("NumFilteredRows", len(filteredRows))
	span.SetTag("PayloadSizeBytes", binary.Size(logRows))
	err := k.Worker.PublicResolver.Clickhouse.BatchWriteLogRows(ctxT, filteredRows)
	if err != nil {
		log.WithContext(ctxT).WithError(err).Error("failed to batch write to clickhouse")
	}
	span.Finish(tracer.WithError(err))

	span, ctxT = tracer.StartSpanFromContext(wCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.markBackend"))
	span.SetTag("NumProjectRows", len(setupProjectIDs))
	span.SetTag("NumSessionRows", len(setupSessionIDs))
	for projectID, types := range setupProjectIDs {
		for t := range types {
			err := k.Worker.PublicResolver.MarkBackendSetupImpl(ctxT, nil, nil, projectID, t)
			if err != nil {
				log.WithContext(ctxT).WithError(err).Errorf("failed to batch mark backend setup for project %d", projectID)
			}
		}
	}
	for sessionID, types := range setupSessionIDs {
		for t := range types {
			err := k.Worker.PublicResolver.MarkBackendSetupImpl(ctxT, nil, pointy.String(sessionID), 0, t)
			if err != nil {
				log.WithContext(ctxT).WithError(err).Errorf("failed to batch mark backend setup for session %s", sessionID)
			}
		}
	}
	span.Finish()

	wSpan.Finish()

	if lastMsg != nil {
		k.KafkaQueue.Commit(ctx, lastMsg.KafkaMessage)
	}
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

package worker

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	e "github.com/pkg/errors"
	"github.com/samber/lo"

	"encoding/binary"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/pricing"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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
			var err error
			defer util.Recover()
			s := tracer.StartSpan("processPublicWorkerMessage", tracer.ResourceName("worker.kafka.process"))
			s.SetTag("worker.goroutine", k.WorkerThread)
			defer s.Finish(tracer.WithError(err))

			s1 := tracer.StartSpan("worker.kafka.receiveMessage", tracer.ChildOf(s.Context()))
			task := k.KafkaQueue.Receive(ctx)
			s1.Finish()

			if task == nil {
				return
			} else if task.Type == kafkaqueue.HealthCheck {
				return
			}
			s.SetTag("taskType", task.Type)
			s.SetTag("partition", task.KafkaMessage.Partition)
			s.SetTag("partitionKey", string(task.KafkaMessage.Key))

			s2 := tracer.StartSpan("worker.kafka.processMessage", tracer.ChildOf(s.Context()))
			for i := 0; i <= task.MaxRetries; i++ {
				if err = k.Worker.processPublicWorkerMessage(tracer.ContextWithSpan(ctx, s), task); err != nil {
					k.processWorkerError(ctx, task, err)
				} else {
					break
				}
			}
			s.SetTag("taskFailures", task.Failures)
			s2.Finish(tracer.WithError(err))

			s3 := tracer.StartSpan("worker.kafka.commitMessage", tracer.ChildOf(s.Context()))
			k.KafkaQueue.Commit(ctx, task.KafkaMessage)
			s3.Finish()

			hlog.Incr("worker.kafka.processed.total", nil, 1)
		}()
	}
}

// BatchFlushSize set per https://clickhouse.com/docs/en/cloud/bestpractices/bulk-inserts
const DefaultBatchFlushSize = 512
const DefaultBatchedFlushTimeout = 5 * time.Second
const SessionsMaxRowsPostgres = 500

type KafkaWorker struct {
	KafkaQueue   *kafkaqueue.Queue
	Worker       *Worker
	WorkerThread int
}

func (k *KafkaBatchWorker) flushLogs(ctx context.Context) {
	s, _ := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.flushLogs"))
	s.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
	defer s.Finish()

	var oldestLogRow *clickhouse.LogRow
	var logRows []*clickhouse.LogRow

	var received int
	var lastMsg *kafkaqueue.Message
	func() {
		for {
			select {
			case lastMsg = <-k.BatchBuffer.messageQueue:
				switch lastMsg.Type {
				case kafkaqueue.PushLogs:
					logRows = append(logRows, lastMsg.PushLogs.LogRows...)
					for _, row := range lastMsg.PushLogs.LogRows {
						if oldestLogRow == nil || row.Timestamp.Before(oldestLogRow.Timestamp) {
							oldestLogRow = row
						}
					}
					received += len(lastMsg.PushLogs.LogRows)
				}
				if received >= k.BatchFlushSize {
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

	var markBackendSetupProjectIds []uint32
	var filteredRows []*clickhouse.LogRow
	for _, logRow := range logRows {
		if logRow.Source == privateModel.LogSourceBackend {
			markBackendSetupProjectIds = append(markBackendSetupProjectIds, logRow.ProjectId)
		}

		// Filter out any log rows for projects where the log quota has been exceeded
		if quotaExceededByProject[logRow.ProjectId] {
			continue
		}

		// Temporarily filter NextJS logs
		// TODO - remove this condition when https://github.com/highlight/highlight/issues/6181 is fixed
		if !strings.HasPrefix(logRow.Body, "ENOENT: no such file or directory") && !strings.HasPrefix(logRow.Body, "connect ECONNREFUSED") {
			filteredRows = append(filteredRows, logRow)
		}
	}

	wSpan, wCtx := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.process"))
	wSpan.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
	wSpan.SetTag("NumProjects", len(workspaceByProject))
	for _, projectId := range markBackendSetupProjectIds {
		err := k.Worker.PublicResolver.MarkBackendSetupImpl(wCtx, int(projectId), model.MarkBackendSetupTypeLogs)
		if err != nil {
			log.WithContext(wCtx).WithError(err).Error("failed to mark backend logs setup")
		}
	}

	span, ctxT := tracer.StartSpanFromContext(wCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.clickhouse.logs"))
	span.SetTag("NumLogRows", len(logRows))
	span.SetTag("NumFilteredRows", len(filteredRows))
	span.SetTag("PayloadSizeBytes", binary.Size(filteredRows))
	if oldestLogRow != nil {
		span.SetTag("MaxIngestDelay", time.Since(oldestLogRow.Timestamp))
	}
	err := k.Worker.PublicResolver.Clickhouse.BatchWriteLogRows(ctxT, filteredRows)
	if err != nil {
		log.WithContext(ctxT).WithError(err).Error("failed to batch write logs to clickhouse")
	}
	span.Finish(tracer.WithError(err))
	wSpan.Finish()

	if lastMsg != nil {
		k.KafkaQueue.Commit(ctx, lastMsg.KafkaMessage)
	}
	k.BatchBuffer.lastMessage = nil
}

func (k *KafkaBatchWorker) flushTraces(ctx context.Context) {
	s, _ := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.flushTraces"))
	s.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
	defer s.Finish()

	var traceRows []*clickhouse.TraceRow

	var received int
	var lastMsg *kafkaqueue.Message
	func() {
		for {
			select {
			case lastMsg = <-k.BatchBuffer.messageQueue:
				switch lastMsg.Type {
				case kafkaqueue.PushTraces:
					traceRows = append(traceRows, lastMsg.PushTraces.TraceRows...)
					received += len(lastMsg.PushTraces.TraceRows)
				}
				if received >= k.BatchFlushSize {
					return
				}
			default:
				return
			}
		}
	}()

	span, ctxT := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.batched.clickhouse.traces"))
	span.SetTag("NumTraceRows", len(traceRows))
	span.SetTag("PayloadSizeBytes", binary.Size(traceRows))
	err := k.Worker.PublicResolver.Clickhouse.BatchWriteTraceRows(ctxT, traceRows)
	if err != nil {
		log.WithContext(ctxT).WithError(err).Error("failed to batch write traces to clickhouse")
	}
	span.Finish(tracer.WithError(err))

	if lastMsg != nil {
		k.KafkaQueue.Commit(ctx, lastMsg.KafkaMessage)
	}
	k.BatchBuffer.lastMessage = nil
}

func (k *KafkaBatchWorker) flushDataSync(ctx context.Context) {
	s, iCtx := tracer.StartSpanFromContext(ctx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.datasync.flush"))
	s.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
	defer s.Finish()

	var sessionIds []int

	readSpan, _ := tracer.StartSpanFromContext(iCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.datasync.readMessages"))
	var lastMsg *kafkaqueue.Message
	func() {
		for {
			select {
			case lastMsg = <-k.BatchBuffer.messageQueue:
				switch lastMsg.Type {
				case kafkaqueue.SessionDataSync:
					sessionIds = append(sessionIds, lastMsg.SessionDataSync.SessionID)
				}
				if len(sessionIds) >= k.BatchFlushSize {
					return
				}
			default:
				return
			}
		}
	}()
	readSpan.Finish()

	sessionIdChunks := lo.Chunk(lo.Uniq(sessionIds), SessionsMaxRowsPostgres)
	if len(sessionIdChunks) > 0 {
		allSessionObjs := []*model.Session{}
		for _, chunk := range sessionIdChunks {
			sessionObjs := []*model.Session{}
			sessionSpan, _ := tracer.StartSpanFromContext(iCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.datasync.readSessions"))
			if err := k.Worker.PublicResolver.DB.Model(&model.Session{}).Preload("ViewedByAdmins").Where("id in ?", chunk).Find(&sessionObjs).Error; err != nil {
				log.WithContext(ctx).Error(err)
			}
			sessionSpan.Finish()

			fieldObjs := []*model.Field{}
			fieldSpan, _ := tracer.StartSpanFromContext(iCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.datasync.readFields"))
			if err := k.Worker.PublicResolver.DB.Model(&model.Field{}).Where("id IN (SELECT field_id FROM session_fields sf WHERE sf.session_id IN ?)", chunk).Find(&fieldObjs).Error; err != nil {
				log.WithContext(ctx).Error(err)
			}
			fieldSpan.Finish()
			fieldsById := lo.KeyBy(fieldObjs, func(f *model.Field) int64 {
				return f.ID
			})

			type sessionField struct {
				SessionID int
				FieldID   int64
			}
			sessionFieldObjs := []*sessionField{}
			sessionFieldSpan, _ := tracer.StartSpanFromContext(iCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.datasync.readSessionFields"))
			if err := k.Worker.PublicResolver.DB.Table("session_fields").Where("session_id IN ?", chunk).Find(&sessionFieldObjs).Error; err != nil {
				log.WithContext(ctx).Error(err)
			}
			sessionFieldSpan.Finish()
			sessionToFields := lo.GroupBy(sessionFieldObjs, func(sf *sessionField) int {
				return sf.SessionID
			})

			for _, session := range sessionObjs {
				session.Fields = lo.Map(sessionToFields[session.ID], func(sf *sessionField, _ int) *model.Field {
					return fieldsById[sf.FieldID]
				})
			}

			allSessionObjs = append(allSessionObjs, sessionObjs...)
		}

		chSpan, _ := tracer.StartSpanFromContext(iCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.datasync.writeClickhouse"))
		if err := k.Worker.PublicResolver.Clickhouse.WriteSessions(ctx, allSessionObjs); err != nil {
			log.WithContext(ctx).Error(err)
		}
		chSpan.Finish()
	}

	kafkaSpan, _ := tracer.StartSpanFromContext(iCtx, "kafkaBatchWorker", tracer.ResourceName("worker.kafka.datasync.commit"))
	if lastMsg != nil {
		k.KafkaQueue.Commit(ctx, lastMsg.KafkaMessage)
	}
	kafkaSpan.Finish()
	k.BatchBuffer.lastMessage = nil
}

func (k *KafkaBatchWorker) ProcessMessages(ctx context.Context, flush func(context.Context)) {
	for {
		func() {
			defer util.Recover()
			s, ctx := tracer.StartSpanFromContext(ctx, "kafkaWorker", tracer.ResourceName(fmt.Sprintf("worker.kafka.%s.process", k.Name)))
			s.SetTag("worker.goroutine", k.WorkerThread)
			s.SetTag("BatchSize", len(k.BatchBuffer.messageQueue))
			defer s.Finish()

			k.BatchBuffer.flushLock.Lock()
			if k.BatchBuffer.lastMessage != nil && time.Since(*k.BatchBuffer.lastMessage) > k.BatchedFlushTimeout {
				s.SetTag("OldestMessage", time.Since(*k.BatchBuffer.lastMessage))
				flush(ctx)
			}
			k.BatchBuffer.flushLock.Unlock()

			s1, _ := tracer.StartSpanFromContext(ctx, "kafkaWorker", tracer.ResourceName(fmt.Sprintf("worker.kafka.%s.receive", k.Name)))
			task := k.KafkaQueue.Receive(ctx)
			s1.Finish()
			if task == nil {
				return
			} else if task.Type == kafkaqueue.HealthCheck {
				return
			}

			k.BatchBuffer.messageQueue <- task

			k.BatchBuffer.flushLock.Lock()
			if k.BatchBuffer.lastMessage == nil {
				t := time.Now()
				k.BatchBuffer.lastMessage = &t
			}
			if len(k.BatchBuffer.messageQueue) >= k.BatchFlushSize {
				flush(ctx)
			}
			k.BatchBuffer.flushLock.Unlock()
		}()
	}
}

type KafkaBatchWorker struct {
	KafkaQueue          *kafkaqueue.Queue
	Worker              *Worker
	WorkerThread        int
	BatchBuffer         *KafkaBatchBuffer
	BatchFlushSize      int
	BatchedFlushTimeout time.Duration
	Name                string
}

type KafkaBatchBuffer struct {
	lastMessage  *time.Time
	messageQueue chan *kafkaqueue.Message
	flushLock    sync.Mutex
}

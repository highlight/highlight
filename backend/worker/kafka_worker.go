package worker

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/highlight/highlight/sdk/highlight-go"

	e "github.com/pkg/errors"
	"github.com/samber/lo"

	"encoding/binary"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	log "github.com/sirupsen/logrus"
)

func (k *KafkaWorker) processWorkerError(ctx context.Context, task *kafkaqueue.Message, err error, start time.Time) {
	log.WithContext(ctx).
		WithError(err).
		WithField("type", task.Type).
		WithField("duration", time.Since(start).Seconds()).
		Errorf("task %+v failed: %s", *task, err)
	if task.Failures >= task.MaxRetries {
		log.WithContext(ctx).
			WithError(err).
			WithField("type", task.Type).
			WithField("failures", task.Failures).
			WithField("duration", time.Since(start).Seconds()).
			Errorf("task %+v failed after %d retries", *task, task.Failures)
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
			s, sCtx := util.StartSpanFromContext(ctx, "processPublicWorkerMessage", util.ResourceName("worker.kafka.process"))
			s.SetAttribute("worker.goroutine", k.WorkerThread)
			defer s.Finish(err)

			s1, _ := util.StartSpanFromContext(sCtx, "worker.kafka.receiveMessage")
			task := k.KafkaQueue.Receive(ctx)
			s1.Finish()

			if task == nil {
				return
			} else if task.Type == kafkaqueue.HealthCheck {
				return
			}
			s.SetAttribute("taskType", task.Type)
			s.SetAttribute("partition", task.KafkaMessage.Partition)
			s.SetAttribute("partitionKey", string(task.KafkaMessage.Key))

			s2, _ := util.StartSpanFromContext(sCtx, "worker.kafka.processMessage")
			for i := 0; i <= task.MaxRetries; i++ {
				start := time.Now()
				if err = k.Worker.processPublicWorkerMessage(sCtx, task); err != nil {
					k.processWorkerError(ctx, task, err, start)
				} else {
					break
				}
			}
			s.SetAttribute("taskFailures", task.Failures)
			s2.Finish(err)

			s3, _ := util.StartSpanFromContext(sCtx, "worker.kafka.commitMessage")
			k.KafkaQueue.Commit(ctx, task.KafkaMessage)
			s3.Finish()

			hlog.Incr("worker.kafka.processed.total", nil, 1)
		}()
	}
}

// DefaultBatchFlushSize set per https://clickhouse.com/docs/en/cloud/bestpractices/bulk-inserts
const DefaultBatchFlushSize = 10000
const DefaultBatchedFlushTimeout = 5 * time.Second
const SessionsMaxRowsPostgres = 500
const ErrorGroupsMaxRowsPostgres = 500
const ErrorObjectsMaxRowsPostgres = 500
const MinRetryDelay = 250 * time.Millisecond

type KafkaWorker struct {
	KafkaQueue   *kafkaqueue.Queue
	Worker       *Worker
	WorkerThread int
}

func (k *KafkaBatchWorker) flush(ctx context.Context) error {
	s, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush", k.Name)))
	s.SetAttribute("BatchSize", len(k.messages))
	defer s.Finish()

	var syncSessionIds []int
	var syncErrorGroupIds []int
	var syncErrorObjectIds []int
	var logRows []*clickhouse.LogRow
	var traceRows []*clickhouse.TraceRow

	var lastMsg *kafkaqueue.Message
	var oldestMsg = time.Now()
	readSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.readMessages", k.Name)))
	for _, lastMsg = range k.messages {
		if lastMsg.KafkaMessage.Time.Before(oldestMsg) {
			oldestMsg = lastMsg.KafkaMessage.Time
		}
		switch lastMsg.Type {
		case kafkaqueue.SessionDataSync:
			syncSessionIds = append(syncSessionIds, lastMsg.SessionDataSync.SessionID)
		case kafkaqueue.ErrorGroupDataSync:
			syncErrorGroupIds = append(syncErrorGroupIds, lastMsg.ErrorGroupDataSync.ErrorGroupID)
		case kafkaqueue.ErrorObjectDataSync:
			syncErrorObjectIds = append(syncErrorObjectIds, lastMsg.ErrorObjectDataSync.ErrorObjectID)
		case kafkaqueue.PushLogs:
			logRow := lastMsg.PushLogs.LogRow
			if logRow != nil {
				logRows = append(logRows, logRow)
			}
		case kafkaqueue.PushTraces:
			traceRow := lastMsg.PushTraces.TraceRow
			if traceRow != nil {
				traceRows = append(traceRows, traceRow)
			}
		}
	}
	k.messages = []*kafkaqueue.Message{}

	readSpan.SetAttribute("MaxIngestDelay", time.Since(oldestMsg).Seconds())
	readSpan.Finish()

	workSpan, wCtx := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.work", k.Name)))
	if len(syncSessionIds) > 0 || len(syncErrorGroupIds) > 0 || len(syncErrorObjectIds) > 0 {
		if err := k.flushDataSync(wCtx, syncSessionIds, syncErrorGroupIds, syncErrorObjectIds); err != nil {
			workSpan.Finish(err)
			return err
		}
	}
	if len(logRows) > 0 {
		if err := k.flushLogs(wCtx, logRows); err != nil {
			workSpan.Finish(err)
			return err
		}
	}
	if len(traceRows) > 0 {
		if err := k.flushTraces(wCtx, traceRows); err != nil {
			workSpan.Finish(err)
			return err
		}
	}
	workSpan.Finish()

	commitSpan, cCtx := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.commit", k.Name)))
	if lastMsg != nil {
		k.KafkaQueue.Commit(cCtx, lastMsg.KafkaMessage)
	}
	commitSpan.Finish()

	return nil
}

func (k *KafkaBatchWorker) getQuotaExceededByProject(ctx context.Context, projectIds map[uint32]struct{}, productType model.PricingProductType) (map[uint32]bool, error) {
	spanW, ctxW := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.checkBillingQuotas", k.Name)))

	// If it's saved in Redis that a project has exceeded / not exceeded
	// its quota, use that value. Else, add the projectId to a list of
	// projects to query.
	quotaExceededByProject := map[uint32]bool{}
	projectsToQuery := []uint32{}
	for projectId := range projectIds {
		exceeded, err := k.Worker.Resolver.Redis.IsBillingQuotaExceeded(ctxW, int(projectId), productType)
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
	// check if that workspace is within the quota,
	// and write the result to redis.
	for _, projectId := range projectsToQuery {
		project, err := k.Worker.Resolver.Store.GetProject(ctx, int(projectId))
		if err != nil {
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

		withinBillingQuota, quotaPercent := k.Worker.PublicResolver.IsWithinQuota(ctxW, productType, &workspace, time.Now())
		quotaExceededByProject[projectId] = !withinBillingQuota
		if err := k.Worker.Resolver.Redis.SetBillingQuotaExceeded(ctxW, int(projectId), productType, !withinBillingQuota); err != nil {
			log.WithContext(ctxW).Error(err)
			return nil, err
		}

		// Send alert emails if above the relevant thresholds
		go func() {
			defer util.Recover()
			var emailType email.EmailType
			if quotaPercent >= 1 {
				if productType == model.PricingProductTypeLogs {
					emailType = email.BillingLogsUsage100Percent
				} else if productType == model.PricingProductTypeTraces {
					emailType = email.BillingTracesUsage100Percent
				}
			} else if quotaPercent >= .8 {
				if productType == model.PricingProductTypeLogs {
					emailType = email.BillingLogsUsage80Percent
				} else if productType == model.PricingProductTypeTraces {
					emailType = email.BillingTracesUsage80Percent
				}
			}

			if emailType != "" {
				if err := model.SendBillingNotifications(ctx, k.Worker.PublicResolver.DB, k.Worker.PublicResolver.MailClient, emailType, &workspace); err != nil {
					log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
				}
			}
		}()
	}

	spanW.Finish()

	return quotaExceededByProject, nil
}

func (k *KafkaBatchWorker) flushLogs(ctx context.Context, logRows []*clickhouse.LogRow) error {
	timestampByProject := map[uint32]time.Time{}
	projectIds := map[uint32]struct{}{}
	for _, row := range logRows {
		if row.Timestamp.After(timestampByProject[row.ProjectId]) {
			timestampByProject[row.ProjectId] = row.Timestamp
			projectIds[row.ProjectId] = struct{}{}
		}
	}

	spanTs, ctxTs := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.setTimestamps", k.Name)))
	for projectId, timestamp := range timestampByProject {
		err := k.Worker.Resolver.Redis.SetLastLogTimestamp(ctxTs, int(projectId), timestamp)
		if err != nil {
			log.WithContext(ctxTs).WithError(err).Errorf("failed to set last log timestamp for project %d", projectId)
		}
	}
	spanTs.Finish()

	quotaExceededByProject, err := k.getQuotaExceededByProject(ctx, projectIds, model.PricingProductTypeLogs)
	if err != nil {
		return err
	}

	var markBackendSetupProjectIds []uint32
	var filteredRows []*clickhouse.LogRow
	for _, logRow := range logRows {
		// create service record for any services found in ingested logs
		if logRow.ServiceName != "" {
			spanX, ctxX := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.UpsertService", k.Name)))

			project, err := k.Worker.Resolver.Store.GetProject(ctx, int(logRow.ProjectId))
			if err == nil && project != nil {
				_, err := k.Worker.Resolver.Store.UpsertService(ctx, *project, logRow.ServiceName, logRow.LogAttributes)

				if err != nil {
					log.WithContext(ctxX).Error(e.Wrap(err, "failed to create service"))
				}
			}

			spanX.Finish()
		}

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

	wSpan, wCtx := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.process", k.Name)))
	wSpan.SetAttribute("BatchSize", len(k.messages))
	wSpan.SetAttribute("NumProjects", len(projectIds))
	for _, projectId := range markBackendSetupProjectIds {
		err := k.Worker.PublicResolver.MarkBackendSetupImpl(wCtx, int(projectId), model.MarkBackendSetupTypeLogs)
		if err != nil {
			log.WithContext(wCtx).WithError(err).Error("failed to mark backend logs setup")
			return err
		}
	}

	span, ctxT := util.StartSpanFromContext(wCtx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.clickhouse.logs", k.Name)))
	span.SetAttribute("NumLogRows", len(logRows))
	span.SetAttribute("NumFilteredRows", len(filteredRows))
	err = k.Worker.PublicResolver.Clickhouse.BatchWriteLogRows(ctxT, filteredRows)
	span.Finish(err)
	if err != nil {
		log.WithContext(ctxT).WithError(err).Error("failed to batch write logs to clickhouse")
		return err
	}
	wSpan.Finish()
	return nil
}

func (k *KafkaBatchWorker) flushTraces(ctx context.Context, traceRows []*clickhouse.TraceRow) error {
	markBackendSetupProjectIds := map[uint32]struct{}{}
	projectIds := map[uint32]struct{}{}
	for _, trace := range traceRows {
		// Skip traces with a `http.method` attribute as likely autoinstrumented frontend traces
		if _, found := trace.TraceAttributes["http.method"]; !found {
			markBackendSetupProjectIds[trace.ProjectId] = struct{}{}
		}
		projectIds[trace.ProjectId] = struct{}{}
	}

	quotaExceededByProject, err := k.getQuotaExceededByProject(ctx, projectIds, model.PricingProductTypeLogs)
	if err != nil {
		return err
	}

	filteredTraceRows := []*clickhouse.TraceRow{}
	for _, trace := range traceRows {
		if quotaExceededByProject[trace.ProjectId] {
			continue
		}
		filteredTraceRows = append(filteredTraceRows, trace)
	}

	span, ctxT := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.clickhouse", k.Name)), util.WithHighlightTracingDisabled(true))
	span.SetAttribute("NumTraceRows", len(traceRows))
	span.SetAttribute("PayloadSizeBytes", binary.Size(traceRows))
	err = k.Worker.PublicResolver.Clickhouse.BatchWriteTraceRows(ctxT, filteredTraceRows)
	defer span.Finish(err)
	if err != nil {
		log.WithContext(ctxT).WithError(err).Error("failed to batch write traces to clickhouse")
		span.Finish(err)
		return err
	}

	for projectId := range markBackendSetupProjectIds {
		err := k.Worker.PublicResolver.MarkBackendSetupImpl(ctx, int(projectId), model.MarkBackendSetupTypeTraces)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to mark backend traces setup")
			return err
		}
	}
	return nil
}

func (k *KafkaBatchWorker) flushDataSync(ctx context.Context, sessionIds []int, errorGroupIds []int, errorObjectIds []int) error {
	sessionIdChunks := lo.Chunk(lo.Uniq(sessionIds), SessionsMaxRowsPostgres)
	if len(sessionIdChunks) > 0 {
		allSessionObjs := []*model.Session{}
		for _, chunk := range sessionIdChunks {
			sessionObjs := []*model.Session{}
			sessionSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.readSessions", k.Name)))
			if err := k.Worker.PublicResolver.DB.Model(&model.Session{}).Preload("ViewedByAdmins").Where("id in ?", chunk).Find(&sessionObjs).Error; err != nil {
				log.WithContext(ctx).Error(err)
				return err
			}
			sessionSpan.Finish()

			fieldObjs := []*model.Field{}
			fieldSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.readFields", k.Name)))
			if err := k.Worker.PublicResolver.DB.Model(&model.Field{}).Where("id IN (SELECT field_id FROM session_fields sf WHERE sf.session_id IN ?)", chunk).Find(&fieldObjs).Error; err != nil {
				log.WithContext(ctx).Error(err)
				return err
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
			sessionFieldSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.readSessionFields", k.Name)))
			if err := k.Worker.PublicResolver.DB.Table("session_fields").Where("session_id IN ?", chunk).Find(&sessionFieldObjs).Error; err != nil {
				log.WithContext(ctx).Error(err)
				return err
			}
			sessionFieldSpan.Finish()
			sessionToFields := lo.GroupBy(sessionFieldObjs, func(sf *sessionField) int {
				return sf.SessionID
			})

			for _, session := range sessionObjs {
				session.Fields = lo.Map(sessionToFields[session.ID], func(sf *sessionField, _ int) *model.Field {
					return fieldsById[sf.FieldID]
				})
				span := util.StartSpan(
					"IsIngestedBy", util.ResourceName("sampling"),
					util.Tag(highlight.ProjectIDAttribute, session.ProjectID),
					util.Tag(highlight.TraceTypeAttribute, highlight.TraceTypeHighlightInternal),
					util.Tag("product", privateModel.ProductTypeSessions),
				)
				// fields are populated, so calculate whether session is excluded
				if k.Worker.PublicResolver.IsSessionExcludedByFilter(ctx, session) {
					reason := privateModel.SessionExcludedReasonExclusionFilter
					session.Excluded = true
					session.ExcludedReason = &reason
					span.SetAttribute("reason", session.ExcludedReason)
					if err := k.Worker.PublicResolver.DB.Model(&model.Session{Model: model.Model{ID: session.ID}}).
						Select("Excluded", "ExcludedReason").Updates(&session).Error; err != nil {
						return err
					}
				}
				span.SetAttribute("ingested", !session.Excluded)
				span.Finish()
			}

			allSessionObjs = append(allSessionObjs, sessionObjs...)
		}

		chSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.flush.clickhouse", k.Name)))
		err := k.Worker.PublicResolver.Clickhouse.WriteSessions(ctx, allSessionObjs)
		defer chSpan.Finish(err)
		if err != nil {
			log.WithContext(ctx).Error(err)
			return err
		}
	}

	errorGroupIdChunks := lo.Chunk(lo.Uniq(errorGroupIds), ErrorGroupsMaxRowsPostgres)
	if len(errorGroupIdChunks) > 0 {
		allErrorGroups := []*model.ErrorGroup{}
		for _, chunk := range errorGroupIdChunks {
			errorGroups := []*model.ErrorGroup{}
			errorGroupSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.datasync.readErrorGroups"))
			if err := k.Worker.PublicResolver.DB.Model(&model.ErrorGroup{}).Joins("ErrorTag").Where("error_groups.id in ?", chunk).Find(&errorGroups).Error; err != nil {
				log.WithContext(ctx).Error(err)
				return err
			}
			errorGroupSpan.Finish()

			allErrorGroups = append(allErrorGroups, errorGroups...)
		}

		chSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.datasync.writeClickhouse.errorGroups"))
		if err := k.Worker.PublicResolver.Clickhouse.WriteErrorGroups(ctx, allErrorGroups); err != nil {
			log.WithContext(ctx).Error(err)
			return err
		}
		chSpan.Finish()
	}

	errorObjectIdChunks := lo.Chunk(lo.Uniq(errorObjectIds), ErrorObjectsMaxRowsPostgres)
	if len(errorObjectIdChunks) > 0 {
		allErrorObjects := []*model.ErrorObject{}
		for _, chunk := range errorObjectIdChunks {
			errorObjects := []*model.ErrorObject{}
			errorObjectSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.datasync.readErrorObjects"))
			if err := k.Worker.PublicResolver.DB.Model(&model.ErrorObject{}).Where("id in ?", chunk).Find(&errorObjects).Error; err != nil {
				log.WithContext(ctx).Error(err)
				return err
			}
			errorObjectSpan.Finish()

			allErrorObjects = append(allErrorObjects, errorObjects...)
		}

		// error objects -> filter non nil -> get session id -> get unique
		uniqueSessionIds := lo.Uniq(lo.Map(lo.Filter(
			allErrorObjects,
			func(eo *model.ErrorObject, _ int) bool { return eo.SessionID != nil }),
			func(eo *model.ErrorObject, _ int) int { return *eo.SessionID }))
		sessionIdChunks := lo.Chunk(uniqueSessionIds, SessionsMaxRowsPostgres)
		allSessions := []*model.Session{}
		for _, chunk := range sessionIdChunks {
			sessions := []*model.Session{}
			sessionSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.datasync.readErrorObjectSessions"))
			if err := k.Worker.PublicResolver.DB.Model(&model.Session{}).Where("id in ?", chunk).Find(&sessions).Error; err != nil {
				log.WithContext(ctx).Error(err)
				return err
			}
			sessionSpan.Finish()

			allSessions = append(allSessions, sessions...)
		}

		chSpan, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.datasync.writeClickhouse.errorObjects"))
		if err := k.Worker.PublicResolver.Clickhouse.WriteErrorObjects(ctx, allErrorObjects, allSessions); err != nil {
			log.WithContext(ctx).Error(err)
			return err
		}
		chSpan.Finish()
	}

	return nil
}

func (k *KafkaBatchWorker) processWorkerError(ctx context.Context, attempt int, err error) {
	log.WithContext(ctx).WithError(err).WithField("worker_name", k.Name).WithField("attempt", attempt).Errorf("batched worker task failed: %s", err)
	// exponential backoff on retries
	time.Sleep(MinRetryDelay * time.Duration(math.Pow(2, float64(attempt))))
}

func (k *KafkaBatchWorker) ProcessMessages(ctx context.Context) {
	for {
		func() {
			defer util.Recover()
			s, ctx := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.process", k.Name)), util.WithHighlightTracingDisabled(k.TracingDisabled))
			s.SetAttribute("worker.goroutine", k.WorkerThread)
			s.SetAttribute("BatchSize", len(k.messages))
			defer s.Finish()

			s1, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName(fmt.Sprintf("worker.kafka.%s.receive", k.Name)))
			task := k.KafkaQueue.Receive(ctx)
			s1.Finish()
			if task == nil {
				return
			} else if task.Type == kafkaqueue.HealthCheck {
				return
			}

			k.messages = append(k.messages, task)

			if time.Since(k.lastFlush) > k.BatchedFlushTimeout || len(k.messages) >= k.BatchFlushSize {
				s.SetAttribute("FlushDelay", time.Since(k.lastFlush).Seconds())

				for i := 0; i <= kafkaqueue.TaskRetries; i++ {
					if err := k.flush(ctx); err != nil {
						k.processWorkerError(ctx, i, err)
					} else {
						break
					}
				}
				k.lastFlush = time.Now()
			}
		}()
	}
}

type KafkaBatchWorker struct {
	KafkaQueue          *kafkaqueue.Queue
	Worker              *Worker
	WorkerThread        int
	BatchFlushSize      int
	BatchedFlushTimeout time.Duration
	Name                string
	TracingDisabled     bool

	lastFlush time.Time
	messages  []*kafkaqueue.Message
}

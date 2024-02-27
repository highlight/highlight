package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"

	model2 "github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"

	"github.com/samber/lo"

	"go.opentelemetry.io/collector/pdata/plog/plogotlp"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"

	"github.com/go-chi/chi"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/clickhouse"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight/highlight/sdk/highlight-go"
)

type Handler struct {
	resolver *graph.Resolver
}

var IgnoredSpanNamePrefixes = []string{"fs "}

func lg(ctx context.Context, fields *extractedFields) *log.Entry {
	if fields == nil {
		return log.WithContext(ctx)
	}
	return log.WithContext(ctx).
		WithField("project_id", fields.projectID).
		WithField("session_id", fields.sessionID).
		WithField("request_id", fields.requestID).
		WithField("source", fields.source).
		WithField("attrs", fields.attrs)
}

func cast[T string | int64 | float64](v interface{}, fallback T) T {
	var empty T
	c, ok := v.(T)
	if !ok || c == empty {
		return fallback
	}
	return c
}

func getBackendError(ctx context.Context, ts time.Time, fields *extractedFields, traceID, spanID string, logCursor *string) (bool, *model.BackendErrorObjectInput) {
	if fields.exceptionType == "" && fields.exceptionMessage == "" {
		lg(ctx, fields).Error("otel received exception with no type and no message")
		return false, nil
	} else if fields.exceptionStackTrace == "" || fields.exceptionStackTrace == "null" {
		lg(ctx, fields).Warn("otel received exception with no stacktrace")
		fields.exceptionStackTrace = ""
	}
	fields.exceptionStackTrace = stacktraces.FormatStructureStackTrace(ctx, fields.exceptionStackTrace)
	payloadBytes, _ := json.Marshal(fields.attrs)
	err := &model.BackendErrorObjectInput{
		SessionSecureID: &fields.sessionID,
		RequestID:       &fields.requestID,
		TraceID:         pointy.String(traceID),
		SpanID:          pointy.String(spanID),
		LogCursor:       logCursor,
		Event:           fields.exceptionMessage,
		Type:            fields.exceptionType,
		Source:          fields.source.String(),
		StackTrace:      fields.exceptionStackTrace,
		Timestamp:       ts,
		Payload:         pointy.String(string(payloadBytes)),
		URL:             fields.errorUrl,
		Environment:     fields.environment,
		Service: &model.ServiceInput{
			Name:    fields.serviceName,
			Version: fields.serviceVersion,
		},
	}
	if fields.sessionID != "" {
		return false, err
	} else if fields.projectID != "" {
		return true, err
	} else {
		return false, nil
	}
}

func getMetric(ctx context.Context, ts time.Time, fields *extractedFields, spanID, parentSpanID, traceID string) (*model.MetricInput, error) {
	if fields.metricEventName == "" {
		return nil, e.New("otel received metric with no name")
	}
	tags := lo.Map(lo.Entries(fields.attrs), func(t lo.Entry[string, string], i int) *model.MetricTag {
		return &model.MetricTag{
			Name:  t.Key,
			Value: t.Value,
		}
	})
	tags = append(tags, &model.MetricTag{
		Name:  string(semconv.ServiceNameKey),
		Value: fields.serviceName,
	}, &model.MetricTag{
		Name:  string(semconv.ServiceVersionKey),
		Value: fields.serviceVersion,
	})
	return &model.MetricInput{
		SessionSecureID: fields.sessionID,
		SpanID:          pointy.String(spanID),
		ParentSpanID:    pointy.String(parentSpanID),
		TraceID:         pointy.String(traceID),
		Group:           pointy.String(fields.requestID),
		Name:            fields.metricEventName,
		Value:           fields.metricEventValue,
		Category:        pointy.String(fields.source.String()),
		Timestamp:       ts,
		Tags:            tags,
	}, nil
}

func (o *Handler) HandleTrace(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid trace logBody")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	gz, err := gzip.NewReader(bytes.NewReader(body))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid gzip format for trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	output, err := io.ReadAll(gz)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid gzip stream for trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := ptraceotlp.NewExportRequest()
	err = req.UnmarshalProto(output)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid trace protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var projectSessionErrors = make(map[string]map[string][]*model.BackendErrorObjectInput)
	var projectLogs = make(map[string][]*clickhouse.LogRow)

	var traceSpans = make(map[string][]*clickhouse.TraceRow)
	var projectTraceMetrics = make(map[string]map[string][]*model.MetricInput)

	curTime := time.Now()

	spans := req.Traces().ResourceSpans()
	for i := 0; i < spans.Len(); i++ {
		resource := spans.At(i).Resource()
		scopeScans := spans.At(i).ScopeSpans()
		for j := 0; j < scopeScans.Len(); j++ {
			spans := scopeScans.At(j).Spans()
			for k := 0; k < spans.Len(); k++ {
				span := spans.At(k)
				events := span.Events()

				// skip a subset of spans (ie. fs spans) from logs / errors / metrics. ingest them as normal traces
				skipped := false
				for _, prefix := range IgnoredSpanNamePrefixes {
					if strings.HasPrefix(span.Name(), prefix) {
						skipped = true
						break
					}
				}

				fields, err := extractFields(ctx, extractFieldsParams{
					resource: &resource,
					span:     &span,
					curTime:  curTime,
				})
				if err != nil {
					lg(ctx, fields).WithError(err).Info("failed to extract fields from span")
					continue
				}
				traceID := cast(fields.requestID, span.TraceID().String())
				spanID := span.SpanID().String()

				spanHasErrors := false
				shouldWriteTrace := true
				for l := 0; l < events.Len(); l++ {
					if skipped {
						break
					}
					event := events.At(l)
					fields, err := extractFields(ctx, extractFieldsParams{
						resource: &resource,
						span:     &span,
						event:    &event,
					})

					if event.Name() == semconv.ExceptionEventName {
						if fields.external {
							lg(ctx, fields).WithError(err).Info("dropping external exception")
							continue
						}

						if fields.exceptionMessage == "" {
							lg(ctx, fields).
								WithField("event", event.Attributes().AsRaw()).
								Info("unexpected empty exception message")
							continue
						}

						var logCursor *string
						logRow := clickhouse.NewLogRow(
							fields.timestamp, uint32(fields.projectIDInt),
							clickhouse.WithTraceID(traceID),
							clickhouse.WithSpanID(spanID),
							clickhouse.WithSecureSessionID(fields.sessionID),
							clickhouse.WithBody(ctx, fields.exceptionMessage),
							clickhouse.WithLogAttributes(fields.attrs),
							clickhouse.WithServiceName(fields.serviceName),
							clickhouse.WithServiceVersion(fields.serviceVersion),
							clickhouse.WithSeverityText("ERROR"),
							clickhouse.WithSource(fields.source),
							clickhouse.WithEnvironment(fields.environment),
						)

						projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
						logCursor = pointy.String(logRow.Cursor())

						_, backendError := getBackendError(ctx, fields.timestamp, fields, traceID, spanID, logCursor)
						if backendError == nil {
							lg(ctx, fields).Error("otel span error got no session and no project")
						} else {
							spanHasErrors = true

							if _, ok := projectSessionErrors[fields.projectID]; !ok {
								projectSessionErrors[fields.projectID] = make(map[string][]*model.BackendErrorObjectInput)
							}
							projectSessionErrors[fields.projectID][fields.sessionID] = append(projectSessionErrors[fields.projectID][fields.sessionID], backendError)
						}
					} else if event.Name() == highlight.LogEvent {
						shouldWriteTrace = false
						if fields.logMessage == "" {
							lg(ctx, fields).Warn("otel received log with no message")
							continue
						}

						if fields.logSeverity == "" {
							fields.logSeverity = "unknown"
						}

						logRow := clickhouse.NewLogRow(
							fields.timestamp, uint32(fields.projectIDInt),
							clickhouse.WithTraceID(traceID),
							clickhouse.WithSecureSessionID(fields.sessionID),
							clickhouse.WithBody(ctx, fields.logMessage),
							clickhouse.WithLogAttributes(fields.attrs),
							clickhouse.WithServiceName(fields.serviceName),
							clickhouse.WithServiceVersion(fields.serviceVersion),
							clickhouse.WithSeverityText(fields.logSeverity),
							clickhouse.WithSource(fields.source),
							clickhouse.WithEnvironment(fields.environment),
						)

						projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
					} else if event.Name() == highlight.MetricEvent {
						shouldWriteTrace = false
						metric, err := getMetric(ctx, fields.timestamp, fields, spanID, span.ParentSpanID().String(), traceID)
						if err != nil {
							lg(ctx, fields).WithError(err).Error("failed to create metric")
							continue
						}
						if _, ok := projectTraceMetrics[fields.projectID]; !ok {
							projectTraceMetrics[fields.projectID] = make(map[string][]*model.MetricInput)
						}
						projectTraceMetrics[fields.projectID][fields.sessionID] = append(projectTraceMetrics[fields.projectID][fields.sessionID], metric)
					} else {
						lg(ctx, fields).Warnf("otel received unknown event %s", event.Name())
					}
				}

				if shouldWriteTrace {
					timestamp := graph.ClampTime(span.StartTimestamp().AsTime(), curTime)
					traceRow := clickhouse.NewTraceRow(timestamp, fields.projectIDInt).
						WithSecureSessionId(fields.sessionID).
						WithTraceId(traceID).
						WithSpanId(spanID).
						WithParentSpanId(span.ParentSpanID().String()).
						WithTraceState(span.TraceState().AsRaw()).
						WithSpanName(span.Name()).
						WithSpanKind(span.Kind().String()).
						WithDuration(span.StartTimestamp().AsTime(), span.EndTimestamp().AsTime()).
						WithServiceName(fields.serviceName).
						WithServiceVersion(fields.serviceVersion).
						WithEnvironment(fields.environment).
						WithHasErrors(spanHasErrors).
						WithStatusCode(span.Status().Code().String()).
						WithStatusMessage(span.Status().Message()).
						WithTraceAttributes(fields.attrs).
						WithEvents(fields.events).
						WithLinks(fields.links)
					traceSpans[traceID] = append(traceSpans[traceID], traceRow)
				}
			}
		}
	}

	keyedErrorMessages := make(map[string][]kafkaqueue.RetryableMessage)
	for projectID, sessionErrors := range projectSessionErrors {
		for sessionID, errors := range sessionErrors {
			for _, errorObject := range errors {
				// cannot return error since we already perform this check for all project errors in `extractFields`
				projectIDInt, _ := model2.FromVerboseID(projectID)
				if !o.resolver.IsErrorIngested(ctx, projectIDInt, errorObject) {
					continue
				}
				// session-less errors will have sessionID = "", which will
				// generate a random key for the kafka message
				keyedErrorMessages[sessionID] = append(keyedErrorMessages[sessionID], &kafkaqueue.Message{
					Type: kafkaqueue.PushBackendPayload,
					PushBackendPayload: &kafkaqueue.PushBackendPayloadArgs{
						ProjectVerboseID: pointy.String(projectID),
						SessionSecureID:  pointy.String(sessionID),
						Errors:           []*model.BackendErrorObjectInput{errorObject},
					}})
			}
		}
	}
	for key, messages := range keyedErrorMessages {
		err = o.resolver.ProducerQueue.Submit(ctx, key, messages...)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to submit otel errors to public worker queue")
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
	}

	for projectID, traceMetrics := range projectTraceMetrics {
		for sessionID, metrics := range traceMetrics {
			var messages []kafkaqueue.RetryableMessage
			for _, metric := range metrics {
				messages = append(messages, &kafkaqueue.Message{
					Type: kafkaqueue.PushMetrics,
					PushMetrics: &kafkaqueue.PushMetricsArgs{
						ProjectVerboseID: &projectID,
						SessionSecureID:  &sessionID,
						Metrics:          []*model.MetricInput{metric},
					}})
			}
			err = o.resolver.ProducerQueue.Submit(ctx, sessionID, messages...)
			if err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to submit otel project metrics to public worker queue")
				w.WriteHeader(http.StatusServiceUnavailable)
				return
			}
		}
	}

	if err := o.submitTraceSpans(ctx, traceSpans); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to submit otel project spans")
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	if err := o.submitProjectLogs(ctx, projectLogs); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to submit otel project logs")
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (o *Handler) HandleLog(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid log logBody")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	gz, err := gzip.NewReader(bytes.NewReader(body))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid gzip format for log")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	output, err := io.ReadAll(gz)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid gzip stream for log")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := plogotlp.NewExportRequest()
	err = req.UnmarshalProto(output)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid log protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var projectLogs = make(map[string][]*clickhouse.LogRow)

	var curTime = time.Now()

	resourceLogs := req.Logs().ResourceLogs()
	for i := 0; i < resourceLogs.Len(); i++ {
		resource := resourceLogs.At(i).Resource()
		scopeLogs := resourceLogs.At(i).ScopeLogs()
		for j := 0; j < scopeLogs.Len(); j++ {
			scopeLogs := scopeLogs.At(j)
			logRecords := scopeLogs.LogRecords()
			for k := 0; k < logRecords.Len(); k++ {
				logRecord := logRecords.At(k)

				fields, err := extractFields(ctx, extractFieldsParams{
					resource:  &resource,
					logRecord: &logRecord,
					curTime:   curTime,
				})
				if err != nil {
					lg(ctx, fields).WithError(err).Info("failed to extract fields from log")
					continue
				}

				logRow := clickhouse.NewLogRow(
					fields.timestamp, uint32(fields.projectIDInt),
					clickhouse.WithTraceID(logRecord.TraceID().String()),
					clickhouse.WithSecureSessionID(fields.sessionID),
					clickhouse.WithBody(ctx, fields.logBody),
					clickhouse.WithLogAttributes(fields.attrs),
					clickhouse.WithServiceName(fields.serviceName),
					clickhouse.WithServiceVersion(fields.serviceVersion),
					clickhouse.WithSeverityText(fields.logSeverity),
					clickhouse.WithSource(fields.source),
					clickhouse.WithEnvironment(fields.environment),
				)

				if fields.projectID != "" {
					if _, ok := projectLogs[fields.projectID]; !ok {
						projectLogs[fields.projectID] = []*clickhouse.LogRow{}
					}
					projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
				} else {
					lg(ctx, fields).Errorf("otel log got no project")
					continue
				}
			}
		}
	}

	if err := o.submitProjectLogs(ctx, projectLogs); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to submit otel project logs")
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (o *Handler) getQuotaExceededByProject(ctx context.Context, projectIds map[uint32]struct{}, productType model2.PricingProductType) (map[uint32]bool, error) {
	// If it's saved in Redis that a project has exceeded / not exceeded
	// its quota, use that value. Else, add the projectId to a list of
	// projects to query.
	quotaExceededByProject := map[uint32]bool{}
	projectsToQuery := []uint32{}
	for projectId := range projectIds {
		exceeded, err := o.resolver.Redis.IsBillingQuotaExceeded(ctx, int(projectId), productType)
		if err != nil {
			log.WithContext(ctx).Error(err)
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
		project, err := o.resolver.Store.GetProject(ctx, int(projectId))
		if err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error querying project"))
			continue
		}

		var workspace model2.Workspace
		if err := o.resolver.DB.WithContext(ctx).Model(&workspace).
			Where("id = ?", project.WorkspaceID).Find(&workspace).Error; err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error querying workspace"))
			continue
		}

		projects := []model2.Project{}
		if err := o.resolver.DB.WithContext(ctx).Order("name ASC").Model(&workspace).Association("Projects").Find(&projects); err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error querying associated projects"))
			continue
		}
		workspace.Projects = projects

		withinBillingQuota, _ := o.resolver.IsWithinQuota(ctx, productType, &workspace, time.Now())
		quotaExceededByProject[projectId] = !withinBillingQuota
		if err := o.resolver.Redis.SetBillingQuotaExceeded(ctx, int(projectId), productType, !withinBillingQuota); err != nil {
			log.WithContext(ctx).Error(err)
			return nil, err
		}
	}

	return quotaExceededByProject, nil
}

func (o *Handler) submitProjectLogs(ctx context.Context, projectLogs map[string][]*clickhouse.LogRow) error {
	projectIds := map[uint32]struct{}{}
	for _, logRows := range projectLogs {
		for _, logRow := range logRows {
			projectIds[logRow.ProjectId] = struct{}{}
			break
		}
	}

	quotaExceededByProject, err := o.getQuotaExceededByProject(ctx, projectIds, model2.PricingProductTypeLogs)
	if err != nil {
		log.WithContext(ctx).Error(err)
		quotaExceededByProject = map[uint32]bool{}
	}

	var markBackendSetupProjectIds []uint32
	var filteredRows []*clickhouse.LogRow
	for _, logRows := range projectLogs {
		for _, logRow := range logRows {
			// create service record for any services found in ingested logs
			if logRow.ServiceName != "" {
				project, err := o.resolver.Store.GetProject(ctx, int(logRow.ProjectId))
				if err == nil && project != nil {
					_, err := o.resolver.Store.UpsertService(ctx, *project, logRow.ServiceName, logRow.LogAttributes)
					if err != nil {
						log.WithContext(ctx).Error(e.Wrap(err, "failed to create service"))
					}
				}
			}

			if logRow.Source == privateModel.LogSourceBackend {
				markBackendSetupProjectIds = append(markBackendSetupProjectIds, logRow.ProjectId)
			}

			// Filter out any log rows for projects where the log quota has been exceeded
			if quotaExceededByProject[logRow.ProjectId] {
				continue
			}

			filteredRows = append(filteredRows, logRow)
		}
	}

	for _, projectId := range markBackendSetupProjectIds {
		err := o.resolver.MarkBackendSetupImpl(ctx, int(projectId), model2.MarkBackendSetupTypeLogs)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to mark backend logs setup")
		}
	}

	var messages []kafkaqueue.RetryableMessage
	for _, logRow := range filteredRows {
		if !o.resolver.IsLogIngested(ctx, logRow) {
			continue
		}
		messages = append(messages, &kafkaqueue.LogRowMessage{
			Type:   kafkaqueue.PushLogsFlattened,
			LogRow: logRow,
		})
	}
	err = o.resolver.BatchedQueue.Submit(ctx, "", messages...)
	if err != nil {
		return e.Wrap(err, "failed to submit otel project logs to public worker queue")
	}
	return nil
}

func (o *Handler) submitTraceSpans(ctx context.Context, traceRows map[string][]*clickhouse.TraceRow) error {
	markBackendSetupProjectIds := map[uint32]struct{}{}
	projectIds := map[uint32]struct{}{}
	for _, traceRows := range traceRows {
		for _, traceRow := range traceRows {
			// Don't mark backend setup for frontend or internal traces
			if value := traceRow.TraceAttributes["highlight.type"]; value != "http.request" && value != "highlight.internal" {
				markBackendSetupProjectIds[traceRow.ProjectId] = struct{}{}
			}
			projectIds[traceRow.ProjectId] = struct{}{}
		}
	}

	quotaExceededByProject, err := o.getQuotaExceededByProject(ctx, projectIds, model2.PricingProductTypeTraces)
	if err != nil {
		log.WithContext(ctx).Error(err)
		quotaExceededByProject = map[uint32]bool{}
	}

	for traceID, traceRows := range traceRows {
		var messages []kafkaqueue.RetryableMessage
		for _, traceRow := range traceRows {
			if quotaExceededByProject[traceRow.ProjectId] {
				continue
			}
			if !o.resolver.IsTraceIngested(ctx, traceRow) {
				continue
			}
			messages = append(messages, &kafkaqueue.TraceRowMessage{
				Type:     kafkaqueue.PushTracesFlattened,
				TraceRow: traceRow,
			})
		}

		err := o.resolver.TracesQueue.Submit(ctx, traceID, messages...)
		if err != nil {
			return e.Wrap(err, "failed to submit otel project traces to public worker queue")
		}
	}

	for projectId := range markBackendSetupProjectIds {
		err := o.resolver.MarkBackendSetupImpl(ctx, int(projectId), model2.MarkBackendSetupTypeTraces)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to mark backend traces setup")
		}
	}

	return nil
}

func (o *Handler) Listen(r *chi.Mux) {
	r.Route("/otel/v1", func(r chi.Router) {
		r.Use(highlightChi.Middleware)
		r.HandleFunc("/traces", o.HandleTrace)
		r.HandleFunc("/logs", o.HandleLog)
	})
}

func New(resolver *graph.Resolver) *Handler {
	return &Handler{
		resolver: resolver,
	}
}

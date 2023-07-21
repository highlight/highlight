package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"time"

	"github.com/samber/lo"

	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/clickhouse"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/collector/pdata/plog/plogotlp"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

type Handler struct {
	resolver *graph.Resolver
}

var fluentProjectPattern = regexp.MustCompile(fmt.Sprintf(`%s=([\S]+)`, highlight.ProjectIDAttribute))

func lg(ctx context.Context, projectID, sessionID, traceID string, source modelInputs.LogSource, resourceAttrs, spanAttrs, eventAttrs map[string]any) *log.Entry {
	return log.WithContext(ctx).
		WithField("project_id", projectID).
		WithField("session_id", sessionID).
		WithField("trace_id", traceID).
		WithField("source", source).
		WithField("resource_attributes", resourceAttrs).
		WithField("span_attributes", spanAttrs).
		WithField("event_attributes", eventAttrs)
}

func cast[T string | int64 | float64](v interface{}, fallback T) T {
	c, ok := v.(T)
	if !ok {
		return fallback
	}
	return c
}

type HighlightFields struct {
	projectID    string
	projectIDInt int
	sessionID    string
	requestID    string
	source       modelInputs.LogSource
	serviceName  string
	host         string
}

func getHighlightFields(attrs map[string]any) (HighlightFields, error) {
	fields := HighlightFields{
		source: modelInputs.LogSourceBackend,
	}

	if val, ok := attrs[highlight.DeprecatedProjectIDAttribute]; ok {
		fields.projectID = val.(string)
	}

	if val, ok := attrs[highlight.ProjectIDAttribute]; ok {
		fields.projectID = val.(string)
	}

	if val, ok := attrs[highlight.DeprecatedSessionIDAttribute]; ok {
		fields.sessionID = val.(string)
	}

	if val, ok := attrs[highlight.SessionIDAttribute]; ok {
		fields.sessionID = val.(string)
	}

	if val, ok := attrs[string(semconv.ServiceNameKey)]; ok {
		fields.serviceName = val.(string)
	}

	if val, ok := attrs[highlight.RequestIDAttribute]; ok {
		fields.requestID = val.(string)
	}

	if val, ok := attrs[highlight.RequestIDAttribute]; ok {
		fields.requestID = val.(string)
	}

	if val, ok := attrs[highlight.DeprecatedSourceAttribute]; ok {
		if val == modelInputs.LogSourceFrontend.String() {
			fields.source = modelInputs.LogSourceFrontend
		}
	}

	if val, ok := attrs[highlight.SourceAttribute]; ok {
		if val == modelInputs.LogSourceFrontend.String() {
			fields.source = modelInputs.LogSourceFrontend
		}
	}

	if fields.projectID != "" {
		if tag := attrs["fluent.tag"]; tag != nil {
			if v, _ := tag.(string); v != "" {
				project := fluentProjectPattern.FindStringSubmatch(v)
				if project != nil {
					fields.projectID = project[1]
				}
			}
		}
	}

	projectIDInt, err := clickhouse.ProjectToInt(fields.projectID)

	if err != nil {
		return fields, err
	}

	fields.projectIDInt = projectIDInt

	return fields, nil
}

func getBackendError(ctx context.Context, ts time.Time, projectID, sessionID, requestID, traceID, spanID string, logCursor *string, excMessage string, source modelInputs.LogSource, host string, resourceAttributes, spanAttributes, eventAttributes map[string]any) (bool, *model.BackendErrorObjectInput) {
	excType := cast(eventAttributes[string(semconv.ExceptionTypeKey)], source.String())
	errorUrl := cast(eventAttributes[highlight.ErrorURLAttribute], source.String())
	stackTrace := cast(eventAttributes[string(semconv.ExceptionStacktraceKey)], "")
	if excType == "" && excMessage == "" {
		lg(ctx, projectID, sessionID, requestID, source, resourceAttributes, spanAttributes, eventAttributes).Error("otel received exception with no type and no message")
		return false, nil
	} else if stackTrace == "" || stackTrace == "null" {
		lg(ctx, projectID, sessionID, requestID, source, resourceAttributes, spanAttributes, eventAttributes).Warn("otel received exception with no stacktrace")
		stackTrace = ""
	}
	stackTrace = stacktraces.FormatStructureStackTrace(ctx, stackTrace)
	payloadBytes, _ := json.Marshal(clickhouse.GetAttributesMap(ctx, resourceAttributes, spanAttributes, eventAttributes, false))
	err := &model.BackendErrorObjectInput{
		SessionSecureID: &sessionID,
		RequestID:       &requestID,
		TraceID:         pointy.String(traceID),
		SpanID:          pointy.String(spanID),
		LogCursor:       logCursor,
		Event:           excMessage,
		Type:            excType,
		Source:          source.String(),
		StackTrace:      stackTrace,
		Timestamp:       ts,
		Payload:         pointy.String(string(payloadBytes)),
		URL:             errorUrl,
	}
	if sessionID != "" {
		return false, err
	} else if projectID != "" {
		return true, err
	} else {
		return false, nil
	}
}

func getMetric(ctx context.Context, ts time.Time, projectID, sessionID, requestID, traceID, spanID string, resourceAttributes, spanAttributes, eventAttributes map[string]any, source modelInputs.LogSource, service string) (*model.MetricInput, error) {
	name, ok := eventAttributes[highlight.MetricEventName].(string)
	if !ok {
		return nil, e.New("otel received metric with no name")
	}
	value, ok := eventAttributes[highlight.MetricEventValue].(float64)
	if !ok {
		return nil, e.New("otel received metric with no value")
	}
	attrs := clickhouse.GetAttributesMap(ctx, resourceAttributes, spanAttributes, eventAttributes, false)
	return &model.MetricInput{
		SessionSecureID: sessionID,
		Group:           pointy.String(requestID),
		Name:            name,
		Value:           value,
		Category:        pointy.String(source.String()),
		Timestamp:       ts,
		Tags: lo.Map(lo.Entries(attrs), func(t lo.Entry[string, string], i int) *model.MetricTag {
			return &model.MetricTag{
				Name:  t.Key,
				Value: t.Value,
			}
		}),
	}, nil
}

func (o *Handler) HandleTrace(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid trace body")
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

	var projectErrors = make(map[string][]*model.BackendErrorObjectInput)
	var traceErrors = make(map[string][]*model.BackendErrorObjectInput)

	var projectLogs = make(map[string][]*clickhouse.LogRow)

	var traceMetrics = make(map[string][]*model.MetricInput)

	spans := req.Traces().ResourceSpans()
	for i := 0; i < spans.Len(); i++ {
		resource := spans.At(i).Resource()
		resourceAttributes := resource.Attributes().AsRaw()
		scopeScans := spans.At(i).ScopeSpans()
		for j := 0; j < scopeScans.Len(); j++ {
			spans := scopeScans.At(j).Spans()
			for k := 0; k < spans.Len(); k++ {
				span := spans.At(k)
				spanAttributes := span.Attributes().AsRaw()
				events := span.Events()
				for l := 0; l < events.Len(); l++ {
					event := events.At(l)
					eventAttributes := event.Attributes().AsRaw()

					fields, err := getHighlightFields(mergeMaps(resourceAttributes, spanAttributes, eventAttributes))
					if err != nil {
						lg(ctx, fields.projectID, fields.sessionID, fields.requestID, fields.source, resourceAttributes, spanAttributes, eventAttributes).WithError(err).Error("failed to extract highlight fields")
					}

					ts := event.Timestamp().AsTime()
					traceID := cast(fields.requestID, span.TraceID().String())
					spanID := span.SpanID().String()
					if event.Name() == semconv.ExceptionEventName {
						excMessage := cast(eventAttributes[string(semconv.ExceptionMessageKey)], "")

						var logCursor *string

						logRow := clickhouse.NewLogRow(
							ts, uint32(fields.projectIDInt),
							clickhouse.WithTraceID(traceID),
							clickhouse.WithSpanID(spanID),
							clickhouse.WithSecureSessionID(fields.sessionID),
							clickhouse.WithBody(ctx, excMessage),
							clickhouse.WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, fields.source == modelInputs.LogSourceFrontend),
							clickhouse.WithServiceName(fields.serviceName),
							clickhouse.WithSeverityText("ERROR"),
							clickhouse.WithSource(fields.source),
						)

						projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
						logCursor = pointy.String(logRow.Cursor())

						isProjectError, backendError := getBackendError(ctx, ts, fields.projectID, fields.sessionID, fields.requestID, traceID, spanID, logCursor, excMessage, fields.source, fields.host, resourceAttributes, spanAttributes, eventAttributes)
						if backendError == nil {
							lg(ctx, fields.projectID, fields.sessionID, fields.requestID, fields.source, resourceAttributes, spanAttributes, eventAttributes).Error("otel span error got no session and no project")
						} else {
							if isProjectError {
								projectErrors[fields.projectID] = append(projectErrors[fields.projectID], backendError)
							} else {
								traceErrors[fields.sessionID] = append(traceErrors[fields.sessionID], backendError)
							}
						}
					} else if event.Name() == highlight.LogEvent {
						logSev := cast(eventAttributes[string(hlog.LogSeverityKey)], "unknown")
						logMessage := cast(eventAttributes[string(hlog.LogMessageKey)], "")
						if logMessage == "" {
							lg(ctx, fields.projectID, fields.sessionID, fields.requestID, fields.source, resourceAttributes, spanAttributes, eventAttributes).Warn("otel received log with no message")
							continue
						}

						logRow := clickhouse.NewLogRow(
							ts, uint32(fields.projectIDInt),
							clickhouse.WithTraceID(traceID),
							clickhouse.WithSpanID(spanID),
							clickhouse.WithSecureSessionID(fields.sessionID),
							clickhouse.WithBody(ctx, logMessage),
							clickhouse.WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, fields.source == modelInputs.LogSourceFrontend),
							clickhouse.WithServiceName(fields.serviceName),
							clickhouse.WithSeverityText(logSev),
							clickhouse.WithSource(fields.source),
						)

						projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
					} else if event.Name() == highlight.MetricEvent {
						metric, err := getMetric(ctx, ts, fields.projectID, fields.sessionID, fields.requestID, traceID, spanID, resourceAttributes, spanAttributes, eventAttributes, fields.source, fields.serviceName)
						if err != nil {
							lg(ctx, fields.projectID, fields.sessionID, fields.requestID, fields.source, resourceAttributes, spanAttributes, eventAttributes).WithError(err).Error("failed to create metric")
							continue
						}

						traceMetrics[fields.sessionID] = append(traceMetrics[fields.sessionID], metric)
					} else {
						lg(ctx, fields.projectID, fields.sessionID, fields.requestID, fields.source, resourceAttributes, spanAttributes, eventAttributes).Warnf("otel received unknown event %s", event.Name())
					}
				}
			}
		}
	}

	for sessionID, errors := range traceErrors {
		err = o.resolver.ProducerQueue.Submit(ctx, &kafkaqueue.Message{
			Type: kafkaqueue.PushBackendPayload,
			PushBackendPayload: &kafkaqueue.PushBackendPayloadArgs{
				SessionSecureID: &sessionID,
				Errors:          errors,
			}}, sessionID)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to submit otel session errors to public worker queue")
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
	}

	for projectID, errors := range projectErrors {
		err = o.resolver.ProducerQueue.Submit(ctx, &kafkaqueue.Message{
			Type: kafkaqueue.PushBackendPayload,
			PushBackendPayload: &kafkaqueue.PushBackendPayloadArgs{
				ProjectVerboseID: &projectID,
				Errors:           errors,
			}}, uuid.New().String())
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to submit otel project errors to public worker queue")
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
	}

	for sessionID, metrics := range traceMetrics {
		err = o.resolver.ProducerQueue.Submit(ctx, &kafkaqueue.Message{
			Type: kafkaqueue.PushMetrics,
			PushMetrics: &kafkaqueue.PushMetricsArgs{
				SessionSecureID: sessionID,
				Metrics:         metrics,
			}}, uuid.New().String())
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to submit otel project metrics to public worker queue")
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
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
		log.WithContext(ctx).WithError(err).Error("invalid log body")
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

	resourceLogs := req.Logs().ResourceLogs()
	for i := 0; i < resourceLogs.Len(); i++ {
		resource := resourceLogs.At(i).Resource()
		resourceAttributes := resource.Attributes().AsRaw()
		scopeLogs := resourceLogs.At(i).ScopeLogs()
		for j := 0; j < scopeLogs.Len(); j++ {
			scopeLogs := scopeLogs.At(j)
			scopeAttributes := scopeLogs.Scope().Attributes().AsRaw()
			logRecords := scopeLogs.LogRecords()
			for k := 0; k < logRecords.Len(); k++ {
				logRecord := logRecords.At(k)
				logAttributes := logRecord.Attributes().AsRaw()

				fields, err := getHighlightFields(mergeMaps(resourceAttributes, logAttributes))
				if err != nil {
					lg(ctx, fields.projectID, fields.sessionID, fields.requestID, fields.source, resourceAttributes, scopeAttributes, logAttributes).WithError(err).Error("failed to extract highlight fields")
				}

				logRow := clickhouse.NewLogRow(
					logRecord.Timestamp().AsTime(), uint32(fields.projectIDInt),
					clickhouse.WithTraceID(logRecord.TraceID().String()),
					clickhouse.WithSpanID(logRecord.SpanID().String()),
					clickhouse.WithSecureSessionID(fields.sessionID),
					clickhouse.WithBody(ctx, logRecord.Body().Str()),
					clickhouse.WithLogAttributes(ctx, resourceAttributes, scopeAttributes, logAttributes, fields.source == modelInputs.LogSourceFrontend),
					clickhouse.WithServiceName(fields.serviceName),
					clickhouse.WithSeverityText(logRecord.SeverityText()),
					clickhouse.WithSource(fields.source),
				)

				if fields.projectID != "" {
					if _, ok := projectLogs[fields.projectID]; !ok {
						projectLogs[fields.projectID] = []*clickhouse.LogRow{}
					}
					projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
				} else {
					lg(ctx, fields.projectID, fields.sessionID, fields.requestID, fields.source, resourceAttributes, scopeAttributes, logAttributes).Errorf("otel log got no project")
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

func (o *Handler) submitProjectLogs(ctx context.Context, projectLogs map[string][]*clickhouse.LogRow) error {
	for _, logRows := range projectLogs {
		err := o.resolver.BatchedQueue.Submit(ctx, &kafkaqueue.Message{
			Type: kafkaqueue.PushLogs,
			PushLogs: &kafkaqueue.PushLogsArgs{
				LogRows: logRows,
			}}, uuid.New().String())
		if err != nil {
			return e.Wrap(err, "failed to submit otel project logs to public worker queue")
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

func mergeMaps(maps ...map[string]any) map[string]any {
	combinedMap := make(map[string]any)

	for _, m := range maps {
		for key, value := range m {
			combinedMap[key] = value
		}
	}

	return combinedMap
}

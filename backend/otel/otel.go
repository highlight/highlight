package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/samber/lo"

	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"

	"github.com/go-chi/chi"
	"github.com/highlight-run/highlight/backend/clickhouse"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight/highlight/sdk/highlight-go"
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

func lg(ctx context.Context, fields extractedFields) *log.Entry {
	return log.WithContext(ctx).
		WithField("project_id", fields.projectID).
		WithField("session_id", fields.sessionID).
		WithField("request_id", fields.requestID).
		WithField("source", fields.source).
		WithField("attrs", fields.attrs)
}

func cast[T string | int64 | float64](v interface{}, fallback T) T {
	c, ok := v.(T)
	if !ok {
		return fallback
	}
	return c
}

func getBackendError(ctx context.Context, ts time.Time, fields extractedFields, traceID, spanID string, logCursor *string) (bool, *model.BackendErrorObjectInput) {
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

func getMetric(ctx context.Context, ts time.Time, fields extractedFields, traceID, spanID string) (*model.MetricInput, error) {
	if fields.metricEventName == "" {
		return nil, e.New("otel received metric with no name")
	}
	return &model.MetricInput{
		SessionSecureID: fields.sessionID,
		Group:           pointy.String(fields.requestID),
		Name:            fields.metricEventName,
		Value:           fields.metricEventValue,
		Category:        pointy.String(fields.source.String()),
		Timestamp:       ts,
		Tags: lo.Map(lo.Entries(fields.attrs), func(t lo.Entry[string, string], i int) *model.MetricTag {
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

	var projectErrors = make(map[string][]*model.BackendErrorObjectInput)
	var traceErrors = make(map[string][]*model.BackendErrorObjectInput)

	var projectLogs = make(map[string][]*clickhouse.LogRow)
	var projectSpans = make(map[int][]*clickhouse.TraceRow)

	var traceMetrics = make(map[string][]*model.MetricInput)

	spans := req.Traces().ResourceSpans()
	for i := 0; i < spans.Len(); i++ {
		resource := spans.At(i).Resource()
		scopeScans := spans.At(i).ScopeSpans()
		for j := 0; j < scopeScans.Len(); j++ {
			spans := scopeScans.At(j).Spans()
			for k := 0; k < spans.Len(); k++ {
				span := spans.At(k)
				events := span.Events()

				fields, err := extractFields(ctx, extractFieldsParams{
					span: &span,
				})
				if err != nil {
					lg(ctx, fields).WithError(err).Error("failed to extract fields from span")
				}

				traceRow := clickhouse.NewTraceRow(span.StartTimestamp().AsTime(), fields.projectIDInt).
					WithSecureSessionId(fields.sessionID).
					WithTraceId(span.TraceID().String()).
					WithSpanId(span.SpanID().String()).
					WithParentSpanId(span.ParentSpanID().String()).
					WithTraceState(span.TraceState().AsRaw()).
					WithSpanName(span.Name()).
					WithSpanKind(span.Kind().String()).
					WithDuration(span.StartTimestamp().AsTime(), span.EndTimestamp().AsTime()).
					WithServiceName(fields.serviceName).
					WithServiceVersion(fields.serviceVersion).
					WithStatusCode(span.Status().Code().String()).
					WithStatusMessage(span.Status().Message()).
					WithTraceAttributes(fields.attrs).
					WithEvents(fields.events).
					WithLinks(fields.links)

				projectSpans[fields.projectIDInt] = append(projectSpans[fields.projectIDInt], traceRow)

				for l := 0; l < events.Len(); l++ {
					event := events.At(l)

					fields, err := extractFields(ctx, extractFieldsParams{
						resource: &resource,
						span:     &span,
						event:    &event,
					})
					if err != nil {
						lg(ctx, fields).WithError(err).Error("failed to extract fields")
					}

					traceID := cast(fields.requestID, span.TraceID().String())
					spanID := span.SpanID().String()
					if event.Name() == semconv.ExceptionEventName {
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
						)

						projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
						logCursor = pointy.String(logRow.Cursor())

						isProjectError, backendError := getBackendError(ctx, fields.timestamp, fields, traceID, spanID, logCursor)
						if backendError == nil {
							lg(ctx, fields).Error("otel span error got no session and no project")
						} else {
							if isProjectError {
								projectErrors[fields.projectID] = append(projectErrors[fields.projectID], backendError)
							} else {
								traceErrors[fields.sessionID] = append(traceErrors[fields.sessionID], backendError)
							}
						}
					} else if event.Name() == highlight.LogEvent {
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
							clickhouse.WithSpanID(spanID),
							clickhouse.WithSecureSessionID(fields.sessionID),
							clickhouse.WithBody(ctx, fields.logMessage),
							clickhouse.WithLogAttributes(fields.attrs),
							clickhouse.WithServiceName(fields.serviceName),
							clickhouse.WithServiceVersion(fields.serviceVersion),
							clickhouse.WithSeverityText(fields.logSeverity),
							clickhouse.WithSource(fields.source),
						)

						projectLogs[fields.projectID] = append(projectLogs[fields.projectID], logRow)
					} else if event.Name() == highlight.MetricEvent {
						metric, err := getMetric(ctx, fields.timestamp, fields, traceID, spanID)
						if err != nil {
							lg(ctx, fields).WithError(err).Error("failed to create metric")
							continue
						}

						traceMetrics[fields.sessionID] = append(traceMetrics[fields.sessionID], metric)
					} else {
						lg(ctx, fields).Warnf("otel received unknown event %s", event.Name())
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
			}}, "")
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
			}}, "")
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to submit otel project metrics to public worker queue")
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
	}

	if err := o.submitProjectSpans(ctx, projectSpans); err != nil {
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
				})
				if err != nil {
					lg(ctx, fields).WithError(err).Error("failed to extract highlight fields")
				}

				logRow := clickhouse.NewLogRow(
					fields.timestamp, uint32(fields.projectIDInt),
					clickhouse.WithTraceID(logRecord.TraceID().String()),
					clickhouse.WithSpanID(logRecord.SpanID().String()),
					clickhouse.WithSecureSessionID(fields.sessionID),
					clickhouse.WithBody(ctx, fields.logBody),
					clickhouse.WithLogAttributes(fields.attrs),
					clickhouse.WithServiceName(fields.serviceName),
					clickhouse.WithServiceVersion(fields.serviceVersion),
					clickhouse.WithSeverityText(fields.logSeverity),
					clickhouse.WithSource(fields.source),
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

func (o *Handler) submitProjectLogs(ctx context.Context, projectLogs map[string][]*clickhouse.LogRow) error {
	for _, logRows := range projectLogs {
		err := o.resolver.BatchedQueue.Submit(ctx, &kafkaqueue.Message{
			Type: kafkaqueue.PushLogs,
			PushLogs: &kafkaqueue.PushLogsArgs{
				LogRows: logRows,
			}}, "")
		if err != nil {
			return e.Wrap(err, "failed to submit otel project logs to public worker queue")
		}
	}
	return nil
}

func (o *Handler) submitProjectSpans(ctx context.Context, projectTraceRows map[int][]*clickhouse.TraceRow) error {
	for projectID, traceRows := range projectTraceRows {
		// Only enable for Highlight's main project
		if projectID != 1 {
			continue
		}

		err := o.resolver.TracesQueue.Submit(ctx, &kafkaqueue.Message{
			Type: kafkaqueue.PushTraces,
			PushTraces: &kafkaqueue.PushTracesArgs{
				TraceRows: traceRows,
			},
		}, "")

		if err != nil {
			return e.Wrap(err, "failed to submit otel project traces to public worker queue")
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

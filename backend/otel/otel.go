package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/clickhouse"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	model2 "github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
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

func lg(ctx context.Context, projectID, sessionID, traceID *string, source *modelInputs.LogSource, resourceAttrs, spanAttrs, eventAttrs map[string]any) *log.Entry {
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

func setHighlightAttributes(attrs map[string]any, projectID, sessionID, requestID *string, source *modelInputs.LogSource) {
	ptrs := map[string]*string{
		highlight.DeprecatedProjectIDAttribute: projectID,
		highlight.DeprecatedSessionIDAttribute: sessionID,
		highlight.DeprecatedRequestIDAttribute: requestID,
		highlight.ProjectIDAttribute:           projectID,
		highlight.SessionIDAttribute:           sessionID,
		highlight.RequestIDAttribute:           requestID,
	}
	for _, k := range []string{
		highlight.DeprecatedProjectIDAttribute,
		highlight.DeprecatedSessionIDAttribute,
		highlight.DeprecatedRequestIDAttribute,
		highlight.ProjectIDAttribute,
		highlight.SessionIDAttribute,
		highlight.RequestIDAttribute,
	} {
		if p, ok := attrs[k]; ok {
			if v, _ := p.(string); v != "" {
				*ptrs[k] = v
			}
		}
	}

	for _, k := range []string{
		highlight.DeprecatedSourceAttribute,
		highlight.SourceAttribute,
	} {
		if p, ok := attrs[k]; ok {
			if v, _ := p.(string); v != "" {
				if v == modelInputs.LogSourceFrontend.String() {
					*source = modelInputs.LogSourceFrontend
				} else {
					*source = modelInputs.LogSourceBackend
				}
			}
		}
	}
}

func getLogRow(ctx context.Context, ts time.Time, lvl, projectID, sessionID, traceID, spanID string, logMessage string, resourceAttributes, spanAttributes, eventAttributes map[string]any, source modelInputs.LogSource) (*clickhouse.LogRow, error) {
	projectIDInt, err := clickhouse.ProjectToInt(projectID)

	if err != nil {
		return nil, err
	}

	return clickhouse.NewLogRow(
		ts, uint32(projectIDInt),
		clickhouse.WithTraceID(traceID),
		clickhouse.WithSpanID(spanID),
		clickhouse.WithSecureSessionID(sessionID),
		clickhouse.WithBody(ctx, logMessage),
		clickhouse.WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, source == modelInputs.LogSourceFrontend),
		clickhouse.WithServiceName(cast(resourceAttributes[string(semconv.ServiceNameKey)], "")),
		clickhouse.WithSeverityText(lvl),
		clickhouse.WithSource(source),
	), nil
}

func getBackendError(ctx context.Context, ts time.Time, projectID, sessionID, requestID, traceID, spanID string, logCursor *string, excMessage string, source modelInputs.LogSource, resourceAttributes, spanAttributes, eventAttributes map[string]any) (bool, *model.BackendErrorObjectInput) {
	excType := cast(eventAttributes[string(semconv.ExceptionTypeKey)], source.String())
	errorUrl := cast(eventAttributes[highlight.ErrorURLAttribute], source.String())
	stackTrace := cast(eventAttributes[string(semconv.ExceptionStacktraceKey)], "")
	if excType == "" && excMessage == "" {
		lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, spanAttributes, eventAttributes).Error("otel received exception with no type and no message")
		return false, nil
	} else if stackTrace == "" || stackTrace == "null" {
		lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, spanAttributes, eventAttributes).Warn("otel received exception with no stacktrace")
		stackTrace = ""
	}
	stackTrace = formatStructureStackTrace(ctx, stackTrace)
	payloadBytes, _ := json.Marshal(clickhouse.GetAttributesMap(ctx, resourceAttributes, spanAttributes, eventAttributes, false))
	err := &model.BackendErrorObjectInput{
		SessionSecureID: &sessionID,
		RequestID:       &requestID,
		TraceID:         pointy.String(traceID),
		SpanID:          pointy.String(spanID),
		LogCursor:       logCursor,
		Event:           excMessage,
		Type:            excType,
		Source:          cast(resourceAttributes[string(semconv.HostNameKey)], ""),
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

	spans := req.Traces().ResourceSpans()
	for i := 0; i < spans.Len(); i++ {
		var projectID, sessionID, requestID string
		var source modelInputs.LogSource
		resource := spans.At(i).Resource()
		resourceAttributes := resource.Attributes().AsRaw()
		setHighlightAttributes(resourceAttributes, &projectID, &sessionID, &requestID, &source)
		scopeScans := spans.At(i).ScopeSpans()
		for j := 0; j < scopeScans.Len(); j++ {
			spans := scopeScans.At(j).Spans()
			for k := 0; k < spans.Len(); k++ {
				span := spans.At(k)
				spanAttributes := span.Attributes().AsRaw()
				setHighlightAttributes(spanAttributes, &projectID, &sessionID, &requestID, &source)
				events := span.Events()
				for l := 0; l < events.Len(); l++ {
					event := events.At(l)
					eventAttributes := event.Attributes().AsRaw()
					setHighlightAttributes(eventAttributes, &projectID, &sessionID, &requestID, &source)
					ts := event.Timestamp().AsTime()
					traceID := cast(requestID, span.TraceID().String())
					spanID := span.SpanID().String()
					if event.Name() == semconv.ExceptionEventName {
						excMessage := cast(eventAttributes[string(semconv.ExceptionMessageKey)], "")

						var logCursor *string
						logRow, err := getLogRow(ctx, ts, "ERROR", projectID, sessionID, traceID, spanID, excMessage, resourceAttributes, spanAttributes, eventAttributes, source)

						if err != nil {
							lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, spanAttributes, eventAttributes).WithError(err).Error("failed to create log row")
							continue
						}

						projectLogs[projectID] = append(projectLogs[projectID], logRow)
						logCursor = pointy.String(logRow.Cursor())

						isProjectError, backendError := getBackendError(ctx, ts, projectID, sessionID, requestID, traceID, spanID, logCursor, excMessage, source, resourceAttributes, spanAttributes, eventAttributes)
						if backendError == nil {
							lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, spanAttributes, eventAttributes).Error("otel span error got no session and no project")
						} else {
							if isProjectError {
								projectErrors[projectID] = append(projectErrors[projectID], backendError)
							} else {
								traceErrors[sessionID] = append(traceErrors[sessionID], backendError)
							}
						}
					} else if event.Name() == highlight.LogEvent {
						logSev := cast(eventAttributes[string(hlog.LogSeverityKey)], "unknown")
						logMessage := cast(eventAttributes[string(hlog.LogMessageKey)], "")
						if logMessage == "" {
							lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, spanAttributes, eventAttributes).Warn("otel received log with no message")
							continue
						}

						logRow, err := getLogRow(
							ctx, ts, logSev, projectID, sessionID, traceID, spanID,
							logMessage, resourceAttributes, spanAttributes, eventAttributes, source,
						)

						if err != nil {
							lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, spanAttributes, eventAttributes).WithError(err).Error("failed to create log row")
							continue
						}

						projectLogs[projectID] = append(projectLogs[projectID], logRow)
					}
				}
			}
		}
	}

	for sessionID, errors := range traceErrors {
		var backendError = false
		for _, err := range errors {
			if err.Type == modelInputs.LogSourceBackend.String() {
				backendError = true
			}
		}
		if backendError {
			err = o.resolver.BatchedQueue.Submit(ctx, &kafkaqueue.Message{
				Type: kafkaqueue.MarkBackendSetup,
				MarkBackendSetup: &kafkaqueue.MarkBackendSetupArgs{
					SessionSecureID: pointy.String(sessionID),
					Type:            model2.MarkBackendSetupTypeError,
				},
			}, sessionID)
			if err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to submit otel mark backend setup")
				w.WriteHeader(http.StatusServiceUnavailable)
				return
			}
		}

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
		var backendError = false
		for _, err := range errors {
			if err.Type == modelInputs.LogSourceBackend.String() {
				backendError = true
			}
		}
		if backendError {
			if projectIDInt, err := clickhouse.ProjectToInt(projectID); err == nil {
				err := o.resolver.BatchedQueue.Submit(ctx, &kafkaqueue.Message{
					Type: kafkaqueue.MarkBackendSetup,
					MarkBackendSetup: &kafkaqueue.MarkBackendSetupArgs{
						ProjectID: projectIDInt,
						Type:      model2.MarkBackendSetupTypeError,
					},
				}, uuid.New().String())
				if err != nil {
					log.WithContext(ctx).WithError(err).Error("failed to submit otel mark backend setup")
					w.WriteHeader(http.StatusServiceUnavailable)
					return
				}
			}
		}

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
		var projectID, sessionID, requestID string
		var source modelInputs.LogSource
		resource := resourceLogs.At(i).Resource()
		resourceAttributes := resource.Attributes().AsRaw()
		setHighlightAttributes(resourceAttributes, &projectID, &sessionID, &requestID, &source)
		scopeLogs := resourceLogs.At(i).ScopeLogs()
		for j := 0; j < scopeLogs.Len(); j++ {
			scopeLogs := scopeLogs.At(j)
			scopeAttributes := scopeLogs.Scope().Attributes().AsRaw()
			logRecords := scopeLogs.LogRecords()
			for k := 0; k < logRecords.Len(); k++ {
				logRecord := logRecords.At(k)
				logAttributes := logRecord.Attributes().AsRaw()
				setHighlightAttributes(logAttributes, &projectID, &sessionID, &requestID, &source)

				logRow, err := getLogRow(ctx, logRecord.Timestamp().AsTime(), logRecord.SeverityText(), projectID, sessionID, logRecord.TraceID().String(), logRecord.SpanID().String(), logRecord.Body().Str(), resourceAttributes, scopeAttributes, logAttributes, source)

				if err != nil {
					lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, scopeAttributes, logAttributes).Errorf("otel log got invalid log record")
					continue
				}

				if projectID != "" {
					if _, ok := projectLogs[projectID]; !ok {
						projectLogs[projectID] = []*clickhouse.LogRow{}
					}
					projectLogs[projectID] = append(projectLogs[projectID], logRow)
				} else {
					lg(ctx, &projectID, &sessionID, &requestID, &source, resourceAttributes, scopeAttributes, logAttributes).Errorf("otel log got no project")
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
	for projectID, logRows := range projectLogs {
		var hasBackendLogs bool
		for _, logRow := range logRows {
			if logRow.Source == modelInputs.LogSourceBackend {
				hasBackendLogs = true
				break
			}
		}

		if projectIDInt, err := clickhouse.ProjectToInt(projectID); hasBackendLogs && err == nil {
			err := o.resolver.BatchedQueue.Submit(ctx, &kafkaqueue.Message{
				Type: kafkaqueue.MarkBackendSetup,
				MarkBackendSetup: &kafkaqueue.MarkBackendSetupArgs{
					ProjectID: projectIDInt,
					Type:      model2.MarkBackendSetupTypeLogs,
				},
			}, uuid.New().String())
			if err != nil {
				return e.Wrap(err, "failed to submit otel mark backend setup")
			}
		}

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

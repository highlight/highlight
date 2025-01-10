package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/smithy-go/ptr"
	"github.com/go-chi/chi"
	"github.com/golang/snappy"
	"github.com/highlight-run/highlight/backend/clickhouse"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	model2 "github.com/highlight-run/highlight/backend/model"
	privateGraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight/highlight/sdk/highlight-go"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/collector/pdata/plog/plogotlp"
	"go.opentelemetry.io/collector/pdata/pmetric"
	"go.opentelemetry.io/collector/pdata/pmetric/pmetricotlp"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
	"io"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"
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
		WithField("attrs", fields.attrs).
		WithField("fields", fields)
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
		// provided input is not an error
		return false, nil
	} else if fields.exceptionStackTrace == "" || fields.exceptionStackTrace == "null" {
		lg(ctx, fields).Warn("otel received exception with no stacktrace")
		fields.exceptionStackTrace = ""
	}
	fields.exceptionStackTrace = stacktraces.FormatStructureStackTrace(ctx, fields.exceptionStackTrace, stacktraces.FromOTeL())
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
	if fields.metricName == "" {
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
		Name:            fields.metricName,
		Value:           fields.metricEventValue,
		Category:        pointy.String(fields.source.String()),
		Timestamp:       ts,
		Tags:            tags,
	}, nil
}

func getBody(ctx context.Context, r *http.Request) ([]byte, error) {
	span, ctx := highlight.StartTrace(ctx, "otel.getReader")
	defer highlight.EndTrace(span)

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid logBody")
		return nil, err
	}
	span.SetAttributes(attribute.Int("request.raw.size", len(body)))

	enc := r.Header.Get("Content-Encoding")
	span.SetAttributes(attribute.String("request.content-encoding", enc))
	var reader io.Reader
	if enc == "gzip" {
		reader, err = gzip.NewReader(bytes.NewReader(body))
		if err != nil {
			return nil, err
		}
	} else if enc == "snappy" {
		reader = snappy.NewReader(bytes.NewReader(body))
	} else {
		return nil, e.New("invalid otel content-encoding header")
	}

	data, err := io.ReadAll(reader)
	span.SetAttributes(attribute.Int("request.decompressed.size", len(data)))
	return data, err
}

func (o *Handler) HandleTrace(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	output, err := getBody(ctx, r)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid data format for trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	span, _ := highlight.StartTrace(ctx, "otel.proto")
	req := ptraceotlp.NewExportRequest()
	err = req.UnmarshalProto(output)
	span.RecordError(err)
	highlight.EndTrace(span)
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
		scopeSpans := spans.At(i).ScopeSpans()
		for j := 0; j < scopeSpans.Len(); j++ {
			scope := scopeSpans.At(j).Scope()
			spans := scopeSpans.At(j).Spans()
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
					headers:  r.Header,
					resource: &resource,
					span:     &span,
					curTime:  curTime,
				})
				if err != nil {
					lg(ctx, fields).
						WithError(err).
						WithField("traceID", span.TraceID().String()).
						Debug("failed to extract fields from span")
					continue
				}
				traceID := cast(fields.requestID, span.TraceID().String())
				spanID := span.SpanID().String()

				spanHasErrors := false
				for l := 0; l < events.Len(); l++ {
					if skipped {
						break
					}
					event := events.At(l)
					fields, err := extractFields(ctx, extractFieldsParams{
						headers:  r.Header,
						resource: &resource,
						scope:    &scope,
						span:     &span,
						event:    &event,
						curTime:  curTime,
					})
					if err != nil {
						lg(ctx, fields).
							WithError(err).
							WithField("traceID", span.TraceID().String()).
							WithField("event", event.Name()).
							Debug("failed to extract fields from span event")
						continue
					}

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
						metric, err := getMetric(ctx, fields.timestamp, fields, spanID, span.ParentSpanID().String(), traceID)
						if err != nil {
							lg(ctx, fields).WithError(err).Error("failed to create metric")
							continue
						}
						if _, ok := projectTraceMetrics[fields.projectID]; !ok {
							projectTraceMetrics[fields.projectID] = make(map[string][]*model.MetricInput)
						}
						projectTraceMetrics[fields.projectID][fields.sessionID] = append(projectTraceMetrics[fields.projectID][fields.sessionID], metric)
					}
					// process unknown events as trace events

					// for ruby SDKs, only process the first event to avoid duplicates
					if fields.attrs["process.runtime.name"] == "ruby" && fields.attrs["telemetry.sdk.name"] == "opentelemetry" {
						break
					}
				}

				// skip log spans
				if span.Name() == highlight.LogrusSpanName || span.Name() == highlight.LogSpanName {
					// skip unless workspace setting is on
					settings, err := o.resolver.Store.GetAllWorkspaceSettingsByProject(ctx, fields.projectIDInt)
					if err != nil {
						if !errors.Is(err, gorm.ErrRecordNotFound) {
							log.WithContext(ctx).WithError(err).Error("failed to get workspace settings")
						}
						continue
					}
					if settings == nil {
						log.WithContext(ctx).Error("no workspace settings found")
						continue
					}
					if !settings.EnableLogTraceIngestion {
						continue
					}
				}

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
			err = o.resolver.AsyncProducerQueue.Submit(ctx, sessionID, messages...)
			if err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to submit otel project metrics to public worker queue")
				w.WriteHeader(http.StatusServiceUnavailable)
				return
			}
		}
	}

	if err := o.submitProjectSessionErrors(ctx, projectSessionErrors); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to submit otel project session errors")
		w.WriteHeader(http.StatusServiceUnavailable)
		return
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

	output, err := getBody(ctx, r)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid data format for trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	span, _ := highlight.StartTrace(ctx, "otel.proto")
	req := plogotlp.NewExportRequest()
	err = req.UnmarshalProto(output)
	span.RecordError(err)
	highlight.EndTrace(span)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid log protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var projectLogs = make(map[string][]*clickhouse.LogRow)
	var projectSessionErrors = make(map[string]map[string][]*model.BackendErrorObjectInput)

	var curTime = time.Now()

	resourceLogs := req.Logs().ResourceLogs()
	for i := 0; i < resourceLogs.Len(); i++ {
		resource := resourceLogs.At(i).Resource()
		scopeLogs := resourceLogs.At(i).ScopeLogs()
		for j := 0; j < scopeLogs.Len(); j++ {
			scopeLog := scopeLogs.At(j)
			scope := scopeLog.Scope()
			logRecords := scopeLog.LogRecords()
			for k := 0; k < logRecords.Len(); k++ {
				logRecord := logRecords.At(k)

				fields, err := extractFields(ctx, extractFieldsParams{
					headers:                r.Header,
					resource:               &resource,
					scope:                  &scope,
					logRecord:              &logRecord,
					curTime:                curTime,
					herokuProjectExtractor: o.matchHerokuDrain,
				})
				if err != nil {
					lg(ctx, fields).
						WithError(err).
						WithField("traceID", logRecord.TraceID().String()).
						WithField("body", logRecord.Body().AsRaw()).
						Debug("failed to extract fields from log")
					continue
				}

				traceID := cast(fields.requestID, logRecord.TraceID().String())
				logRow := clickhouse.NewLogRow(
					fields.timestamp, uint32(fields.projectIDInt),
					clickhouse.WithTraceID(traceID),
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

				_, backendError := getBackendError(ctx, fields.timestamp, fields, traceID, logRecord.SpanID().String(), pointy.String(logRow.Cursor()))
				if backendError != nil {
					if _, ok := projectSessionErrors[fields.projectID]; !ok {
						projectSessionErrors[fields.projectID] = make(map[string][]*model.BackendErrorObjectInput)
					}
					projectSessionErrors[fields.projectID][fields.sessionID] = append(projectSessionErrors[fields.projectID][fields.sessionID], backendError)
				}
			}
		}
	}

	if err := o.submitProjectLogs(ctx, projectLogs); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to submit otel project logs")
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	if err := o.submitProjectSessionErrors(ctx, projectSessionErrors); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to submit otel log project session errors")
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (o *Handler) HandleMetric(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	output, err := getBody(ctx, r)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid data format for trace")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	span, _ := highlight.StartTrace(ctx, "otel.proto")
	req := pmetricotlp.NewExportRequest()
	err = req.UnmarshalProto(output)
	span.RecordError(err)
	highlight.EndTrace(span)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("invalid metric protobuf")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var projectMetrics = make(map[int][]clickhouse.MetricRow)
	var projectRetentions = make(map[int]uint8)

	var curTime = time.Now()
	resourceMetrics := req.Metrics().ResourceMetrics()
	for i := 0; i < resourceMetrics.Len(); i++ {
		resource := resourceMetrics.At(i).Resource()
		scopeMetrics := resourceMetrics.At(i).ScopeMetrics()
		for j := 0; j < scopeMetrics.Len(); j++ {
			scopeMetric := scopeMetrics.At(j)
			scope := scopeMetric.Scope()
			metrics := scopeMetric.Metrics()
			for k := 0; k < metrics.Len(); k++ {
				metric := metrics.At(k)
				var dps []DataPoint
				if metric.Type() == pmetric.MetricTypeGauge {
					for l := 0; l < metric.Gauge().DataPoints().Len(); l++ {
						dps = append(dps, &NumberDataPoint{metric.Gauge().DataPoints().At(l)})
					}
				} else if metric.Type() == pmetric.MetricTypeSum {
					for l := 0; l < metric.Sum().DataPoints().Len(); l++ {
						dps = append(dps, &NumberDataPoint{metric.Sum().DataPoints().At(l)})
					}
				} else if metric.Type() == pmetric.MetricTypeHistogram {
					for l := 0; l < metric.Histogram().DataPoints().Len(); l++ {
						dps = append(dps, &HistogramDataPoint{metric.Histogram().DataPoints().At(l)})
					}
				} else if metric.Type() == pmetric.MetricTypeExponentialHistogram {
					for l := 0; l < metric.ExponentialHistogram().DataPoints().Len(); l++ {
						dps = append(dps, &ExponentialHistogramDataPoint{metric.ExponentialHistogram().DataPoints().At(l)})
					}
				} else if metric.Type() == pmetric.MetricTypeSummary {
					for l := 0; l < metric.Summary().DataPoints().Len(); l++ {
						dps = append(dps, &SummaryDataPoint{metric.Summary().DataPoints().At(l)})
					}
				}
				for _, dp := range dps {
					fields, err := extractFields(r.Context(), extractFieldsParams{
						headers:          r.Header,
						resource:         &resource,
						scope:            &scope,
						metric:           &metric,
						metricAttributes: dp.ExtractAttributes(),
						curTime:          curTime,
					})
					if err != nil {
						lg(ctx, fields).WithError(err).Info("failed to extract fields from metric data point")
						continue
					}
					if _, ok := projectRetentions[fields.projectIDInt]; !ok {
						projectRetentions[fields.projectIDInt] = o.getProjectRetention(ctx, fields.projectIDInt)
					}
					if _, ok := projectMetrics[fields.projectIDInt]; !ok {
						projectMetrics[fields.projectIDInt] = []clickhouse.MetricRow{}
					}
					projectMetrics[fields.projectIDInt] = append(projectMetrics[fields.projectIDInt], dp.ToMetricRow(ctx, projectRetentions[fields.projectIDInt], metric.Type(), fields))
				}
			}
		}
	}

	if err := o.submitProjectMetrics(ctx, projectMetrics); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to submit otel project metrics")
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (o *Handler) getQuotaExceededByProject(ctx context.Context, projectIds map[uint32]struct{}, productType model2.PricingProductType) (map[uint32]bool, error) {
	span, ctx := highlight.StartTrace(ctx, "otel.getQuotaExceededByProject", attribute.Int("NumProjects", len(projectIds)), attribute.String("ProductType", string(productType)))
	defer highlight.EndTrace(span)
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
	span, ctx := highlight.StartTrace(ctx, "otel.submitProjectLogs")
	defer highlight.EndTrace(span)

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

	sp, c := highlight.StartTrace(ctx, "otel.upsertServices")
	var markBackendSetupProjectIds []uint32
	var filteredRows []*clickhouse.LogRow
	for _, logRows := range projectLogs {
		for _, logRow := range logRows {
			// create service record for any services found in ingested logs
			if logRow.ServiceName != "" {
				if _, err = o.resolver.Store.UpsertService(c, int(logRow.ProjectId), logRow.ServiceName, logRow.LogAttributes); err != nil {
					log.WithContext(c).Error(e.Wrap(err, "failed to upsert service"))
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
	highlight.EndTrace(sp)

	sp, c = highlight.StartTrace(ctx, "otel.markBackendSetupImpl")
	for _, projectId := range markBackendSetupProjectIds {
		err := o.resolver.MarkBackendSetupImpl(c, int(projectId), model2.MarkBackendSetupTypeLogs)
		if err != nil {
			log.WithContext(c).WithError(err).Error("failed to mark backend logs setup")
		}
	}
	highlight.EndTrace(sp)

	sp, c = highlight.StartTrace(ctx, "otel.prepareMessages")
	var messages []kafkaqueue.RetryableMessage
	for _, logRow := range filteredRows {
		if !o.resolver.IsLogIngested(c, logRow) {
			continue
		}
		messages = append(messages, &kafkaqueue.LogRowMessage{
			Type:   kafkaqueue.PushLogsFlattened,
			LogRow: logRow,
		})
	}
	highlight.EndTrace(sp)

	err = o.resolver.BatchedQueue.Submit(ctx, "", messages...)
	if err != nil {
		return e.Wrap(err, "failed to submit otel project logs to public worker queue")
	}
	return nil
}

func (o *Handler) submitProjectSessionErrors(ctx context.Context, projectSessionErrors map[string]map[string][]*model.BackendErrorObjectInput) error {
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
		err := o.resolver.AsyncProducerQueue.Submit(ctx, key, messages...)
		if err != nil {
			return e.Wrap(err, "failed to submit otel errors to public worker queue")
		}
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
				Type:               kafkaqueue.PushTracesFlattened,
				ClickhouseTraceRow: clickhouse.ConvertTraceRow(traceRow),
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

func (o *Handler) submitProjectMetrics(ctx context.Context, projectMetricRows map[int][]clickhouse.MetricRow) error {
	projectIds := lo.MapEntries(projectMetricRows, func(p int, _ []clickhouse.MetricRow) (uint32, struct{}) {
		return uint32(p), struct{}{}
	})
	quotaExceededByProject, err := o.getQuotaExceededByProject(ctx, projectIds, model2.PricingProductTypeMetrics)
	if err != nil {
		log.WithContext(ctx).Error(err)
		quotaExceededByProject = map[uint32]bool{}
	}

	var sumMessages, histogramMessages, summaryMessages []kafkaqueue.RetryableMessage
	for projectID, metricRows := range projectMetricRows {
		for _, metricRow := range metricRows {
			if metricRow == nil {
				continue
			}
			if quotaExceededByProject[uint32(projectID)] {
				continue
			}
			if !o.resolver.IsMetricIngested(ctx, metricRow) {
				continue
			}
			if metricSumRow, ok := metricRow.(*clickhouse.MetricSumRow); ok {
				sumMessages = append(sumMessages, &kafkaqueue.OTeLMetricSumRow{
					Type:         kafkaqueue.PushOTeLMetricSum,
					MetricSumRow: metricSumRow,
				})
			}
			if metricHistogramRow, ok := metricRow.(*clickhouse.MetricHistogramRow); ok {
				histogramMessages = append(histogramMessages, &kafkaqueue.OTeLMetricHistogramRow{
					Type:               kafkaqueue.PushOTeLMetricHistogram,
					MetricHistogramRow: metricHistogramRow,
				})
			}
			if metricSummaryRow, ok := metricRow.(*clickhouse.MetricSummaryRow); ok {
				summaryMessages = append(summaryMessages, &kafkaqueue.OTeLMetricSummaryRow{
					Type:             kafkaqueue.PushOTeLMetricSummary,
					MetricSummaryRow: metricSummaryRow,
				})
			}
		}

		// no ordering for metrics data
		err := o.resolver.MetricSumQueue.Submit(ctx, "", sumMessages...)
		if err != nil {
			return e.Wrap(err, "failed to submit otel project sum metrics to public worker queue")
		}
		err = o.resolver.MetricHistogramQueue.Submit(ctx, "", histogramMessages...)
		if err != nil {
			return e.Wrap(err, "failed to submit otel project histogram metrics to public worker queue")
		}
		err = o.resolver.MetricSummaryQueue.Submit(ctx, "", summaryMessages...)
		if err != nil {
			return e.Wrap(err, "failed to submit otel project summary metrics to public worker queue")
		}
	}

	for projectId := range projectIds {
		err := o.resolver.MarkBackendSetupImpl(ctx, int(projectId), model2.MarkBackendSetupTypeMetrics)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to mark backend metrics setup")
		}
	}

	return nil
}

func (o *Handler) matchHerokuDrain(ctx context.Context, herokuDrainToken string) (string, int) {
	data, err := redis.CachedEval(ctx, o.resolver.Redis, fmt.Sprintf("matchHerokuDrain-%s", herokuDrainToken), time.Minute, time.Second, func() (*int, error) {
		projectMapping := &model2.IntegrationProjectMapping{
			IntegrationType: privateModel.IntegrationTypeHeroku,
			ExternalID:      herokuDrainToken,
		}
		if err := o.resolver.DB.
			Model(&projectMapping).
			Where(&projectMapping).
			Take(&projectMapping).Error; err != nil {
			return nil, err
		}
		return &projectMapping.ProjectID, nil
	})
	if data == nil || err != nil {
		log.WithContext(ctx).WithError(err).WithField("token", herokuDrainToken).Error("failed to find heroku drain token")
		return herokuDrainToken, 0
	}

	return strconv.Itoa(*data), *data
}

func (o *Handler) Listen(r *chi.Mux) {
	r.Route("/otel/v1", func(r chi.Router) {
		r.Use(highlightChi.UseMiddleware(trace.WithSpanKind(trace.SpanKindConsumer)))
		r.HandleFunc("/traces", o.HandleTrace)
		r.HandleFunc("/logs", o.HandleLog)
		r.HandleFunc("/metrics", o.HandleMetric)
	})
}

func (o *Handler) getProjectRetention(ctx context.Context, projectID int) uint8 {
	data, err := redis.CachedEval(ctx, o.resolver.Redis, fmt.Sprintf("getProjectRetention-%d", projectID), time.Minute, time.Second, func() (*uint8, error) {
		proj, err := o.resolver.Store.GetProject(ctx, projectID)
		if err != nil {
			return nil, err
		}

		ws, err := o.resolver.Store.GetWorkspace(ctx, proj.WorkspaceID)
		if err != nil {
			return nil, err
		}

		hours := time.Since(privateGraph.GetRetentionDate(ws.MetricsRetentionPeriod)).Hours()
		days := math.Round(hours / 24.)
		return ptr.Uint8(uint8(days)), nil
	})
	if err != nil || data == nil {
		log.WithContext(ctx).WithError(err).Error("failed to getProjectRetention")
		return 30
	}
	return *data
}

func New(resolver *graph.Resolver) *Handler {
	return &Handler{
		resolver: resolver,
	}
}

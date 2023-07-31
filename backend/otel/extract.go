package otel

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	model "github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	e "github.com/pkg/errors"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/plog"
	"go.opentelemetry.io/collector/pdata/ptrace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

var fluentProjectPattern = regexp.MustCompile(fmt.Sprintf(`%s=([\S]+)`, highlight.ProjectIDAttribute))

// Extracted fields
type extractedFields struct {
	projectID      string
	projectIDInt   int
	sessionID      string
	requestID      string
	logBody        string
	source         modelInputs.LogSource
	serviceName    string
	serviceVersion string

	timestamp time.Time

	logSeverity string
	logMessage  string

	exceptionType       string
	exceptionMessage    string
	exceptionStackTrace string
	errorUrl            string

	metricEventName  string
	metricEventValue float64

	// This represents the merged result of resource, span...log attributes
	// _after_ we extract fields out. In other words, if `serviceName` is extracted, it won't be included
	// in this map.
	// This is the data that should be written to the attributes column (e.g. LogAttributes)
	attrs map[string]string
}

type extractFieldsParams struct {
	resource  *pcommon.Resource
	span      *ptrace.Span
	event     *ptrace.SpanEvent
	scopeLogs *plog.ScopeLogs
	logRecord *plog.LogRecord
}

func extractFields(ctx context.Context, params extractFieldsParams) (extractedFields, error) {
	fields := extractedFields{
		source: modelInputs.LogSourceBackend,
	}

	var resourceAttributes, spanAttributes, eventAttributes, scopeAttributes, logAttributes map[string]any
	if params.resource != nil {
		resourceAttributes = params.resource.Attributes().AsRaw()
	}

	if params.span != nil {
		spanAttributes = params.span.Attributes().AsRaw()
	}

	if params.event != nil {
		eventAttributes = params.event.Attributes().AsRaw()
		fields.timestamp = params.event.Timestamp().AsTime()
	}

	if params.scopeLogs != nil {
		scopeAttributes = params.scopeLogs.Scope().Attributes().AsRaw()
	}

	if params.logRecord != nil {
		fields.timestamp = params.logRecord.Timestamp().AsTime()
		fields.logSeverity = params.logRecord.SeverityText()
		logAttributes = params.logRecord.Attributes().AsRaw()
		// this could be a log record from syslog, with a projectID token prefix. ie:
		// 1jdkoe52 <1>1 2023-07-27T05:43:22.401882Z render render-log-endpoint-test 1 render-log-endpoint-test - Render test log
		fields.logBody = params.logRecord.Body().Str()
		if len(fields.logBody) > 0 {
			if fields.logBody[0] != '<' {
				parts := strings.SplitN(fields.logBody, " <", 2)
				if len(parts) == 2 {
					fields.projectID = parts[0]
					fields.logBody = "<" + parts[1]
				}
			}
		}
	}

	attrs := mergeMaps(
		resourceAttributes,
		spanAttributes,
		eventAttributes,
		scopeAttributes,
		logAttributes,
	)

	// process potential syslog message
	if len(fields.logBody) > 0 && fields.logBody[0] == '<' {
		extractSyslog(&fields, attrs)
	}

	if val, ok := attrs[highlight.DeprecatedProjectIDAttribute]; ok {
		fields.projectID = val.(string)
		delete(attrs, highlight.DeprecatedProjectIDAttribute)
	}

	if val, ok := attrs[highlight.ProjectIDAttribute]; ok {
		fields.projectID = val.(string)
		delete(attrs, highlight.ProjectIDAttribute)
	}

	if val, ok := attrs[highlight.DeprecatedSessionIDAttribute]; ok {
		fields.sessionID = val.(string)
		delete(attrs, highlight.DeprecatedSessionIDAttribute)
	}

	if val, ok := attrs[highlight.SessionIDAttribute]; ok {
		fields.sessionID = val.(string)
		delete(attrs, highlight.SessionIDAttribute)
	}

	if val, ok := attrs[highlight.DeprecatedSourceAttribute]; ok {
		if val == modelInputs.LogSourceFrontend.String() {
			fields.source = modelInputs.LogSourceFrontend
		}
		delete(attrs, highlight.DeprecatedSourceAttribute)
	}

	if val, ok := attrs[highlight.SourceAttribute]; ok {
		if val == modelInputs.LogSourceFrontend.String() {
			fields.source = modelInputs.LogSourceFrontend
		}
		delete(attrs, highlight.SourceAttribute)
	}

	if val, ok := attrs[highlight.RequestIDAttribute]; ok {
		fields.requestID = val.(string)
		delete(attrs, highlight.RequestIDAttribute)
	}

	if val, ok := attrs[highlight.LogSeverityAttribute]; ok {
		fields.logSeverity = val.(string)
		delete(attrs, highlight.LogSeverityAttribute)
	}

	if val, ok := attrs[highlight.LogMessageAttribute]; ok {
		fields.logMessage = val.(string)
		delete(attrs, highlight.LogMessageAttribute)
	}

	if val, ok := attrs[highlight.MetricEventName]; ok {
		fields.metricEventName = val.(string)
		delete(attrs, highlight.MetricEventName)
	}

	if val, ok := attrs[highlight.MetricEventValue]; ok {
		float64Value, ok := val.(float64)
		if ok {
			fields.metricEventValue = float64Value
			delete(attrs, highlight.MetricEventValue)
		} else {
			stringValue, ok := val.(string)
			if ok {
				parsedFloat64Value, err := strconv.ParseFloat(stringValue, 64)
				if err == nil {
					fields.metricEventValue = parsedFloat64Value
					delete(attrs, highlight.MetricEventValue)
				}
			}
		}
	}

	if val, ok := eventAttributes[string(semconv.ExceptionTypeKey)]; ok { // we know that exception.type will be in the event attributes map
		fields.exceptionType = val.(string)
		delete(attrs, string(semconv.ExceptionTypeKey))
	}

	if val, ok := eventAttributes[string(semconv.ExceptionMessageKey)]; ok { // we know that exception.message will be in the event attributes map
		fields.exceptionMessage = val.(string)
		delete(attrs, string(semconv.ExceptionMessageKey))
	}

	if val, ok := eventAttributes[string(semconv.ExceptionStacktraceKey)]; ok { // we know that exception.stacktrace will be in the event attributes map
		fields.exceptionStackTrace = val.(string)
		delete(attrs, string(semconv.ExceptionStacktraceKey))
	}

	if val, ok := eventAttributes[highlight.ErrorURLAttribute]; ok { // we know that URL will be in the event attributes map
		fields.errorUrl = val.(string)
		delete(attrs, highlight.ErrorURLAttribute)
	}

	if val, ok := resourceAttributes[string(semconv.ServiceNameKey)]; ok { // we know that service name will be in the resource map
		fields.serviceName = val.(string)
		if strings.Contains(fields.serviceName, "unknown_service") || fields.serviceName == "highlight-sdk" {
			fields.serviceName = ""
		}

		delete(attrs, string(semconv.ServiceNameKey))
	}

	if val, ok := resourceAttributes[string(semconv.ServiceVersionKey)]; ok { // we know that service version will be in the resource hash
		fields.serviceVersion = val.(string)
		delete(attrs, string(semconv.ServiceVersionKey))
	}

	if fields.projectID == "" {
		if tag := attrs["fluent.tag"]; tag != nil {
			if v, _ := tag.(string); v != "" {
				project := fluentProjectPattern.FindStringSubmatch(v)
				if project != nil {
					fields.projectID = project[1]
				}
			}
			delete(attrs, "fluent.tag")
		}
	}

	attributesMap := make(map[string]string)
	for k, v := range attrs {
		prefixes := []string{}
		if fields.source == modelInputs.LogSourceFrontend {
			prefixes = append(prefixes, highlight.BackendOnlyAttributePrefixes...)
		}

		shouldSkip := false
		for _, prefix := range prefixes {
			if strings.HasPrefix(k, prefix) {
				shouldSkip = true
				break
			}
		}
		if shouldSkip {
			continue
		}

		for key, value := range util.FormatLogAttributes(ctx, k, v) {
			attributesMap[key] = value
		}
	}
	fields.attrs = attributesMap

	projectIDInt, err := projectToInt(fields.projectID)

	if err != nil {
		return fields, err
	}

	fields.projectIDInt = projectIDInt

	return fields, nil
}

func mergeMaps(maps ...map[string]any) map[string]any {
	merged := make(map[string]any)

	for _, m := range maps {
		for key, value := range m {
			merged[key] = value
		}
	}

	return merged
}

func projectToInt(projectID string) (int, error) {
	i, err := strconv.ParseInt(projectID, 10, 32)
	if err == nil {
		return int(i), nil
	}
	i2, err := model.FromVerboseID(projectID)
	if err == nil {
		return i2, nil
	}
	return 0, e.New(fmt.Sprintf("invalid project id %s", projectID))
}

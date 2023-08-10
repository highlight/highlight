package otel

import (
	"context"
	"testing"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

func newResource(t *testing.T, attrs map[string]any) pcommon.Resource {
	resource := pcommon.NewResource()

	containsProjectID := false
	for k := range attrs {
		if k == highlight.DeprecatedProjectIDAttribute {
			containsProjectID = true
		}
		if k == highlight.ProjectIDAttribute {
			containsProjectID = true
		}
	}

	if !containsProjectID {
		attrs[highlight.ProjectIDAttribute] = "1"
	}

	for k, v := range attrs {
		c, ok := v.(string)
		if ok {
			resource.Attributes().PutStr(k, c)
		} else {
			c, ok := v.(float64)
			if ok {
				resource.Attributes().PutDouble(k, c)
			} else {
				assert.Fail(t, "Failed to set resource value.")
			}
		}
	}
	return resource
}

func newEvent(attrs map[string]string) ptrace.SpanEvent {
	event := ptrace.NewSpanEvent()
	for k, v := range attrs {
		event.Attributes().PutStr(k, v)
	}
	return event
}

func newSpan(attrs map[string]string) ptrace.Span {
	traces := ptrace.NewTraces()
	rspans := traces.ResourceSpans().AppendEmpty()
	ispans := rspans.ScopeSpans().AppendEmpty()
	span := ispans.Spans().AppendEmpty()
	span.Attributes().PutStr(highlight.ProjectIDAttribute, "1")

	for k, v := range attrs {
		span.Attributes().PutStr(k, v)
	}

	return span
}

func TestExtractFields_ExtractProjectID(t *testing.T) {
	resource := newResource(t, map[string]any{
		highlight.DeprecatedProjectIDAttribute: "1",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.projectID, "1")
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(t, map[string]any{
		highlight.ProjectIDAttribute: "1",
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.projectID, "1")
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = pcommon.NewResource()
	resource.Attributes().PutStr("fluent.tag", "highlight.project_id=99")
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.projectID, "99")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractSessionID(t *testing.T) {
	resource := newResource(t, map[string]any{
		highlight.DeprecatedSessionIDAttribute: "session_abc",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{
		resource: &resource,
	})
	assert.NoError(t, err)
	assert.Equal(t, fields.sessionID, "session_abc")
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(t, map[string]any{
		highlight.SessionIDAttribute: "session_abc",
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.sessionID, "session_abc")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractSource(t *testing.T) {
	resource := newResource(t, map[string]any{})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.source, modelInputs.LogSourceBackend) // defaults to backend
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(t, map[string]any{
		highlight.DeprecatedSourceAttribute: modelInputs.LogSourceFrontend.String(),
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.source, modelInputs.LogSourceFrontend)
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(t, map[string]any{
		highlight.SourceAttribute: modelInputs.LogSourceFrontend.String(),
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.source, modelInputs.LogSourceFrontend)
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractRequestID(t *testing.T) {
	resource := newResource(t, map[string]any{
		highlight.RequestIDAttribute: "request_id",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.requestID, "request_id")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractMetricEventName(t *testing.T) {
	resource := newResource(t, map[string]any{
		highlight.MetricEventName: "metric_name",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.metricEventName, "metric_name")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractMetricEventValue(t *testing.T) {
	resource := newResource(t, map[string]any{
		highlight.MetricEventValue: float64(99),
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.metricEventValue, float64(99))
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractMetricEventValueHandlesBadInput(t *testing.T) {
	resource := newResource(t, map[string]any{
		highlight.MetricEventValue: "99",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.metricEventValue, float64(99))
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractLogSeverity(t *testing.T) {
	resource := newResource(t, map[string]any{})
	event := newEvent(map[string]string{
		highlight.LogSeverityAttribute: "log_severity",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource, event: &event})
	assert.NoError(t, err)
	assert.Equal(t, fields.logSeverity, "log_severity")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractLogMessage(t *testing.T) {
	resource := newResource(t, map[string]any{})
	event := newEvent(map[string]string{
		highlight.LogMessageAttribute: "log_message",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource, event: &event})
	assert.NoError(t, err)
	assert.Equal(t, fields.logMessage, "log_message")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractExceptionType(t *testing.T) {
	resource := newResource(t, map[string]any{})
	event := newEvent(map[string]string{
		string(semconv.ExceptionTypeKey): "exception_type",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource, event: &event})
	assert.NoError(t, err)
	assert.Equal(t, fields.exceptionType, "exception_type")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractExceptionMessage(t *testing.T) {
	resource := newResource(t, map[string]any{})
	event := newEvent(map[string]string{
		string(semconv.ExceptionMessageKey): "exception_message",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource, event: &event})
	assert.NoError(t, err)
	assert.Equal(t, fields.exceptionMessage, "exception_message")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractExceptionStacktrace(t *testing.T) {
	resource := newResource(t, map[string]any{})
	event := newEvent(map[string]string{
		string(semconv.ExceptionStacktraceKey): "exception_stacktrace",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource, event: &event})
	assert.NoError(t, err)
	assert.Equal(t, fields.exceptionStackTrace, "exception_stacktrace")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractErrorURL(t *testing.T) {
	resource := newResource(t, map[string]any{})
	event := newEvent(map[string]string{
		highlight.ErrorURLAttribute: "error_url",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource, event: &event})
	assert.NoError(t, err)
	assert.Equal(t, fields.errorUrl, "error_url")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractServiceName(t *testing.T) {
	resource := newResource(t, map[string]any{
		"service.name": "my_service",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.serviceName, "my_service")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractServiceNameForFrontendSource(t *testing.T) {
	resource := newResource(t, map[string]any{
		"service.name": "my_service",
	})

	span := newSpan(map[string]string{
		"highlight.source": string(modelInputs.LogSourceFrontend),
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{
		resource: &resource,
		span:     &span,
	})
	assert.NoError(t, err)
	assert.Equal(t, "", fields.serviceName)
}

func TestExtractFields_RewriteServiceName(t *testing.T) {
	resource := newResource(t, map[string]any{
		"service.name": "unknown_service:/opt/homebrew/Cellar/node/19.6.0/bin/node",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.serviceName, "")
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(t, map[string]any{
		"service.name": "highlight-sdk", // Was accidentally set by the ruby SDK
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.serviceName, "")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractServiceVersion(t *testing.T) {
	resource := newResource(t, map[string]any{
		"service.version": "abc123",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.serviceVersion, "abc123")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractEvents(t *testing.T) {
	span := newSpan(map[string]string{})
	event := span.Events().AppendEmpty()
	event.SetName("event_123")

	fields, err := extractFields(context.TODO(), extractFieldsParams{span: &span})
	assert.NoError(t, err)
	assert.Equal(t, fields.events[0]["Name"], "event_123")
}

func TestExtractFields_ExtractLinks(t *testing.T) {
	span := newSpan(map[string]string{})
	link := span.Links().AppendEmpty()
	link.TraceState().FromRaw("link:state")

	fields, err := extractFields(context.TODO(), extractFieldsParams{span: &span})
	assert.NoError(t, err)
	assert.Equal(t, fields.links[0]["TraceState"], "link:state")
}

func TestExtractFields_ExtractEventsLinksNone(t *testing.T) {
	resource := newResource(t, map[string]any{})

	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, len(fields.events), 0)
	assert.Equal(t, len(fields.links), 0)
}

func TestExtractFields_OmitLogSeverity(t *testing.T) {
	resource := newResource(t, map[string]any{
		"os.description": "Debian GNU/Linux 11 (bullseye)",
		"log.severity":   "info", // should be skipped since this is an internal attribute
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.attrs, map[string]string{
		"os.description": "Debian GNU/Linux 11 (bullseye)",
	})
}

func TestExtractFields_OmitBackendPropertiesForFrontendSource(t *testing.T) {
	resource := newResource(t, map[string]any{
		"os.description":   "Debian GNU/Linux 11 (bullseye)", // should be skipped since this is a frontend source
		"highlight.source": "frontend",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_TrimLongFields(t *testing.T) {
	var value string
	for i := 0; i < 2<<16; i++ {
		value += "a"
	}

	resource := newResource(t, map[string]any{
		"foo": value,
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, 2048+3, len(fields.attrs["foo"]))
}

func TestMergeMaps(t *testing.T) {
	logAttributes := map[string]any{
		"foo": "bar",
	}

	resourceAttributes := map[string]any{
		"baz": "buzz",
	}

	merged := mergeMaps(resourceAttributes, logAttributes)
	assert.Equal(t, map[string]any{
		"foo": "bar",
		"baz": "buzz",
	}, merged)
}

package otel

import (
	"context"
	"testing"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/collector/pdata/pcommon"
)

func newResource(attrs map[string]string) pcommon.Resource {
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
		resource.Attributes().PutStr(k, v)
	}
	return resource
}

func TestExtractFields_ExtractProjectID(t *testing.T) {
	resource := newResource(map[string]string{
		highlight.DeprecatedProjectIDAttribute: "1",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.projectID, "1")
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(map[string]string{
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
	resource := newResource(map[string]string{
		highlight.DeprecatedSessionIDAttribute: "session_abc",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{
		resource: &resource,
	})
	assert.NoError(t, err)
	assert.Equal(t, fields.sessionID, "session_abc")
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(map[string]string{
		highlight.SessionIDAttribute: "session_abc",
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.sessionID, "session_abc")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractSource(t *testing.T) {
	resource := newResource(map[string]string{})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.source, modelInputs.LogSourceBackend) // defaults to backend
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(map[string]string{
		highlight.DeprecatedSourceAttribute: modelInputs.LogSourceFrontend.String(),
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.source, modelInputs.LogSourceFrontend)
	assert.Equal(t, fields.attrs, map[string]string{})

	resource = newResource(map[string]string{
		highlight.SourceAttribute: modelInputs.LogSourceFrontend.String(),
	})
	fields, err = extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.source, modelInputs.LogSourceFrontend)
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractRequestID(t *testing.T) {
	resource := newResource(map[string]string{
		highlight.RequestIDAttribute: "request_id",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.requestID, "request_id")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractServiceName(t *testing.T) {
	resource := newResource(map[string]string{
		"service.name": "my_service",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.serviceName, "my_service")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_ExtractServiceVersion(t *testing.T) {
	resource := newResource(map[string]string{
		"service.version": "abc123",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.serviceVersion, "abc123")
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_OmitLogSeverity(t *testing.T) {
	resource := newResource(map[string]string{
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
	resource := newResource(map[string]string{
		"os.description":   "Debian GNU/Linux 11 (bullseye)", // should be skipped since this is a frontend source
		"highlight.source": "frontend",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.attrs, map[string]string{})
}

func TestExtractFields_OmitExceptionProperties(t *testing.T) {
	resource := newResource(map[string]string{
		"exception.message":    "foo",
		"exception.stacktrace": "bar",
		"exception.type":       "baz",
	})
	fields, err := extractFields(context.TODO(), extractFieldsParams{resource: &resource})
	assert.NoError(t, err)
	assert.Equal(t, fields.attrs, map[string]string{
		"exception.type": "baz",
	})
}

func TestExtractFields_TrimLongFields(t *testing.T) {
	var value string
	for i := 0; i < 2<<16; i++ {
		value += "a"
	}

	resource := newResource(map[string]string{
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

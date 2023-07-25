package clickhouse

import (
	"context"
	"testing"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"

	"github.com/stretchr/testify/assert"
)

func TestNewLogRowWithLogAttributes(t *testing.T) {
	resourceAttributes := map[string]any{"os.description": "Debian GNU/Linux 11 (bullseye)"}
	spanAttributes := map[string]any{"highlight.source": "frontend", "foo": "bar"}
	eventAttributes := map[string]any{"log.severity": "info"} // should be skipped since this is an internal attribute

	now := time.Now()

	logRow := NewLogRow(now, 1, WithLogAttributes(context.TODO(), resourceAttributes, spanAttributes, eventAttributes, false))

	assert.Equal(t, map[string]string{"foo": "bar", "os.description": "Debian GNU/Linux 11 (bullseye)"}, logRow.LogAttributes)

	logRow = NewLogRow(now, 1, WithLogAttributes(context.TODO(), resourceAttributes, spanAttributes, eventAttributes, true))

	assert.Equal(t, map[string]string{"foo": "bar"}, logRow.LogAttributes)
}

func TestNewLogRowWithSeverityText(t *testing.T) {
	now := time.Now()
	assert.Equal(t, "warn", NewLogRow(now, 1, WithSeverityText("WARN")).SeverityText, "it downcases")
	assert.Equal(t, "info", NewLogRow(now, 1, WithSeverityText("dir")).SeverityText, "it defaults to info when unknown")
	assert.Equal(t, int32(4), NewLogRow(now, 1, WithSeverityText("dir")).SeverityNumber, "it handles figuring out the severity number")
}

func TestNewLogRowWithServiceVersion(t *testing.T) {
	now := time.Now()
	assert.Equal(t, "abc123", NewLogRow(now, 1, WithServiceVersion("abc123")).ServiceVersion)
}

func TestNewLogRowWithException(t *testing.T) {
	now := time.Now()
	ctx := context.TODO()
	var resourceAttributes, spanAttributes, eventAttributes map[string]any
	resourceAttributes = map[string]any{
		"exception.message":    "foo",
		"exception.stacktrace": "bar",
		"exception.type":       "baz",
	}
	lr := NewLogRow(now, 1, WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, false))
	assert.Equal(t, "", lr.LogAttributes["exception.message"])
	assert.Equal(t, "", lr.LogAttributes["exception.stacktrace"])
	assert.Equal(t, "baz", lr.LogAttributes["exception.type"])
}

func TestNewLogRowWithLongField(t *testing.T) {
	now := time.Now()
	ctx := context.TODO()
	var resourceAttributes, spanAttributes, eventAttributes map[string]any
	var value string
	for i := 0; i < 2<<16; i++ {
		value += "a"
	}
	spanAttributes = map[string]any{"foo": value}
	lr := NewLogRow(now, 1, WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, false))
	assert.Equal(t, 2048+3, len(lr.LogAttributes["foo"]))
}

func TestNewLogRowWithLongBody(t *testing.T) {
	now := time.Now()
	ctx := context.TODO()
	var body string
	for i := 0; i < 2<<16; i++ {
		body += "a"
	}
	lr := NewLogRow(now, 1, WithBody(ctx, body))
	assert.Equal(t, 2048+3, len(lr.Body))
}

func TestNewLogRowWithSource(t *testing.T) {
	now := time.Now()
	lr := NewLogRow(now, 1, WithSource(modelInputs.LogSourceFrontend))
	assert.Equal(t, modelInputs.LogSourceFrontend, lr.Source)

	lr = NewLogRow(now, 1, WithSource(modelInputs.LogSourceBackend))
	assert.Equal(t, modelInputs.LogSourceBackend, lr.Source)
}

func TestNewLogRowWithTimestamp(t *testing.T) {
	ts := time.Now()
	lr := NewLogRow(ts, 1)
	// log row should be created with second precision, per clickhouse precision
	assert.Equal(t, ts.Truncate(time.Second), lr.Timestamp)
}

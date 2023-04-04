package clickhouse

import (
	"context"
	"github.com/highlight/highlight/sdk/highlight-go"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewLogRowWithLogAttributes(t *testing.T) {
	resourceAttributes := map[string]any{"os.description": "Debian GNU/Linux 11 (bullseye)"}
	spanAttributes := map[string]any{"highlight.source": "frontend", "foo": "bar"}
	eventAttributes := map[string]any{"log.severity": "info"} // should be skipped since this is an internal attribute

	logRow := NewLogRow(LogRowPrimaryAttrs{}, WithLogAttributes(context.TODO(), resourceAttributes, spanAttributes, eventAttributes, false))

	assert.Equal(t, map[string]string{"foo": "bar", "os.description": "Debian GNU/Linux 11 (bullseye)"}, logRow.LogAttributes)

	logRow = NewLogRow(LogRowPrimaryAttrs{}, WithLogAttributes(context.TODO(), resourceAttributes, spanAttributes, eventAttributes, true))

	assert.Equal(t, map[string]string{"foo": "bar"}, logRow.LogAttributes)
}

func TestNewLogRowWithSeverityText(t *testing.T) {
	assert.Equal(t, "warn", NewLogRow(LogRowPrimaryAttrs{}, WithSeverityText("WARN")).SeverityText, "it downcases")
	assert.Equal(t, "info", NewLogRow(LogRowPrimaryAttrs{}, WithSeverityText("dir")).SeverityText, "it defaults to info when unknown")
	assert.Equal(t, int32(4), NewLogRow(LogRowPrimaryAttrs{}, WithSeverityText("dir")).SeverityNumber, "it handles figuring out the severity number")
}

func TestNewLogRowWithException(t *testing.T) {
	ctx := context.TODO()
	var resourceAttributes, spanAttributes, eventAttributes map[string]any
	resourceAttributes = map[string]any{
		"exception.message":    "foo",
		"exception.stacktrace": "bar",
		"exception.type":       "baz",
	}
	lr := NewLogRow(LogRowPrimaryAttrs{}, WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, false))
	assert.Equal(t, "", lr.LogAttributes["exception.message"])
	assert.Equal(t, "", lr.LogAttributes["exception.stacktrace"])
	assert.Equal(t, "baz", lr.LogAttributes["exception.type"])
}

func TestNewLogRowWithLongField(t *testing.T) {
	ctx := context.TODO()
	var resourceAttributes, spanAttributes, eventAttributes map[string]any
	var value string
	for i := 0; i < 2<<16; i++ {
		value += "a"
	}
	spanAttributes = map[string]any{"foo": value}
	lr := NewLogRow(LogRowPrimaryAttrs{}, WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, false))
	assert.Equal(t, 2048+3, len(lr.LogAttributes["foo"]))
}

func TestNewLogRowWithLongBody(t *testing.T) {
	ctx := context.TODO()
	var body string
	for i := 0; i < 2<<16; i++ {
		body += "a"
	}
	lr := NewLogRow(LogRowPrimaryAttrs{}, WithBody(ctx, body))
	assert.Equal(t, 2048+3, len(lr.Body))
}

func TestNewLogRowWithSource(t *testing.T) {
	lr := NewLogRow(LogRowPrimaryAttrs{}, WithSource(highlight.SourceAttributeFrontend))
	assert.Equal(t, LogRowSourceValueFrontend, lr.Source)
	assert.Equal(t, "frontend", LogRowSourceValueFrontend)
	lr = NewLogRow(LogRowPrimaryAttrs{}, WithSource("InterceptField"))
	assert.Equal(t, LogRowSourceValueBackend, lr.Source)
	assert.Equal(t, "backend", LogRowSourceValueBackend)
}

func TestNewLogRowWithTimestamp(t *testing.T) {
	ts := time.Now()
	lr := NewLogRow(LogRowPrimaryAttrs{}, WithTimestamp(ts))
	// log row should be created with second precision, per clickhouse precision
	assert.Equal(t, ts.Truncate(time.Second), lr.Timestamp)
}

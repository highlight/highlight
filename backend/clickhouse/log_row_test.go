package clickhouse

import (
	"context"
	"testing"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"

	"github.com/stretchr/testify/assert"
)

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

func TestNewLogRowWithLongBody(t *testing.T) {
	now := time.Now()
	ctx := context.TODO()
	var body string
	for i := 0; i < 2<<16; i++ {
		body += "a"
	}
	lr := NewLogRow(now, 1, WithBody(ctx, body))
	assert.Equal(t, 65536+3, len(lr.Body))
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

func TestNewLogRowWithZeroTimestamp(t *testing.T) {
	ts := time.Unix(0, 1).UTC().Add(-1 * time.Second)
	lr := NewLogRow(ts, 1)
	assert.WithinDuration(t, lr.Timestamp, time.Now(), 10*time.Second)
}

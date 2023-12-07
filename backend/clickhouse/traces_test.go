package clickhouse

import (
	"context"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/queryparser"

	"github.com/stretchr/testify/assert"
)

func TestBatchWriteTraceRows(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*TraceRow{
		NewTraceRow(now, 1).WithServiceName("gqlgen"),
	}

	assert.NoError(t, client.BatchWriteTraceRows(ctx, rows))
}

func Test_TraceMatchesQuery(t *testing.T) {
	trace := TraceRow{}
	filters := queryparser.Parse("os.type:linux resource_name:worker.* service_name:all")
	matches := TraceMatchesQuery(&trace, &filters)
	assert.False(t, matches)

	trace = TraceRow{
		ServiceName: "all",
		TraceAttributes: map[string]string{
			"os.type":       "linux",
			"resource_name": "worker.kafka.process",
		},
	}
	filters = queryparser.Parse("os.type:linux resource_name:worker.* service_name:all")
	matches = TraceMatchesQuery(&trace, &filters)
	assert.True(t, matches)
}

func TestNewTraceRowWithEnvironment(t *testing.T) {
	now := time.Now()
	assert.Equal(t, "production", NewTraceRow(now, 1).WithEnvironment("production").Environment)
}

package clickhouse

import (
	"context"
	"testing"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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

func TestReadTracesWithEnvironmentFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*TraceRow{
		NewTraceRow(now, 1),
		NewTraceRow(now, 1).WithEnvironment("production"),
		NewTraceRow(now, 1).WithEnvironment("development"),
	}

	assert.NoError(t, client.BatchWriteTraceRows(ctx, rows))

	payload, err := client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:production",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "production", payload.Edges[0].Node.Environment)

	payload, err = client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:*dev*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "development", payload.Edges[0].Node.Environment)

	payload, err = client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:(production OR development)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

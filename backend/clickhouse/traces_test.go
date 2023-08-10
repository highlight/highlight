package clickhouse

import (
	"context"
	"testing"
	"time"

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

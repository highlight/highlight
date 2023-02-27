package clickhouse

import (
	"context"
	"testing"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestEncodeDecode(t *testing.T) {
	now := time.Now()
	cursor := encodeCursor(now, "uuid")

	timestamp, uuid, err := decodeCursor(cursor)
	assert.NoError(t, err)

	assert.Equal(t, timestamp.UnixNano(), now.UnixNano())
	assert.Equal(t, "uuid", uuid)
}

func TestClickhouseDecode(t *testing.T) {
	ctx := context.Background()
	client, err := setupClickhouseTestDB()

	assert.NoError(t, err)

	defer func() {
		client.conn.Exec(ctx, "TRUNCATE TABLE logs") //nolint:errcheck
	}()

	now := time.Now()
	rows := []*LogRow{
		{
			Timestamp: now,
			ProjectId: 1,
		},
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, nil)
	assert.NoError(t, err)

	cursor := payload.Edges[0].Cursor
	assert.NoError(t, err)

	timestamp, _, err := decodeCursor(cursor)
	assert.NoError(t, err)
	assert.Equal(t, timestamp.UnixNano(), payload.Edges[0].Node.Timestamp.UnixNano())
}

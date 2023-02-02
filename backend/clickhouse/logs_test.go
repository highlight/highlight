package clickhouse

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestReadLogs(t *testing.T) {
	ctx := context.Background()
	client, err := setupClickhouseTestDB()

	require.NoError(t, err)

	defer func() {
		client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", LogsTable)) //nolint:errcheck
	}()

	now := time.Now()
	rows := []*LogRow{
		{
			Timestamp:    now,
			ProjectId:    1,
			Body:         "body",
			SeverityText: "info",
		},
	}

	require.NoError(t, client.BatchWriteLogRows(ctx, rows))
	logLines, err := client.ReadLogs(ctx, 1)
	require.NoError(t, err)

	assert.Len(t, logLines, 1)
	assert.Equal(t, now.UnixMilli(), logLines[0].Timestamp.UnixMilli())
	assert.Equal(t, "info", logLines[0].SeverityText)
	assert.Equal(t, "body", logLines[0].Body)
}

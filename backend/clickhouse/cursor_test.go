package clickhouse

import (
	"context"
	"testing"
	"time"

	"github.com/aws/smithy-go/ptr"
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
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
		},
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)

	cursor := payload.Edges[0].Cursor
	assert.NoError(t, err)

	timestamp, _, err := decodeCursor(cursor)
	assert.NoError(t, err)
	assert.Equal(t, timestamp.UnixNano(), payload.Edges[0].Node.Timestamp.UnixNano())
}

func TestGetLogsConnectionAfter(t *testing.T) {
	cursor := ptr.String("cursor")
	pagination := Pagination{
		After: cursor,
	}

	// no edges
	// edges := []*modelInputs.LogEdge{}
	// connection := getLogsConnection(edges, pagination)

	// assert.Equal(t, &modelInputs.LogsConnection{
	// 	Edges: edges,
	// 	PageInfo: &modelInputs.PageInfo{
	// 		HasNextPage:     false,
	// 		HasPreviousPage: false,
	// 		EndCursor:       "",
	// 		StartCursor:     "",
	// 	},
	// }, connection)

	// one edge
	edges := []*modelInputs.LogEdge{makeEdge()}
	connection := getLogsConnection(edges, pagination)

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: edges,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     false,
			HasPreviousPage: false,
			EndCursor:       *cursor,
			StartCursor:     *cursor,
		},
	}, connection)

}

func TestGetLogsConnectionBefore(t *testing.T) {

}

func TestGetLogsConnectionAt(t *testing.T) {

}

func makeEdge() *modelInputs.LogEdge {
	return &modelInputs.LogEdge{}

}

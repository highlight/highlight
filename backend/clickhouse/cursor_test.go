package clickhouse

import (
	"context"
	"testing"
	"time"

	"github.com/aws/smithy-go/ptr"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestGetConnectionAfter(t *testing.T) {
	zeroEdges := []*modelInputs.LogEdge{}
	oneEdge := []*modelInputs.LogEdge{
		{
			Cursor: "cursor",
		},
	}

	manyEdges := []*modelInputs.LogEdge{}
	for i := 1; i <= LogsLimit+1; i++ {
		manyEdges = append(manyEdges, &modelInputs.LogEdge{
			Cursor: "cursor",
		})
	}

	connection := getLogsConnection(zeroEdges, Pagination{
		After: ptr.String("cursor"),
	})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: zeroEdges,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     false,
			HasPreviousPage: true,
			StartCursor:     "",
			EndCursor:       "",
		},
	}, connection)

	connection = getLogsConnection(oneEdge, Pagination{
		After: ptr.String("cursor"),
	})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: oneEdge,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     false,
			HasPreviousPage: true,
			StartCursor:     "cursor",
			EndCursor:       "cursor",
		},
	}, connection)

	connection = getLogsConnection(manyEdges, Pagination{
		After: ptr.String("cursor"),
	})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: manyEdges[:100],
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: true,
			StartCursor:     "cursor",
			EndCursor:       "cursor",
		},
	}, connection)
}

func TestGetConnectionBefore(t *testing.T) {
	zeroEdges := []*modelInputs.LogEdge{}
	oneEdge := []*modelInputs.LogEdge{
		{
			Cursor: "cursor",
		},
	}

	manyEdges := []*modelInputs.LogEdge{}
	for i := 1; i <= LogsLimit+1; i++ {
		manyEdges = append(manyEdges, &modelInputs.LogEdge{
			Cursor: "cursor",
		})
	}

	connection := getLogsConnection(zeroEdges, Pagination{
		Before: ptr.String("cursor"),
	})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: zeroEdges,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: false,
			StartCursor:     "",
			EndCursor:       "",
		},
	}, connection)

	connection = getLogsConnection(oneEdge, Pagination{
		Before: ptr.String("cursor"),
	})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: oneEdge,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: false,
			StartCursor:     "cursor",
			EndCursor:       "cursor",
		},
	}, connection)

	connection = getLogsConnection(manyEdges, Pagination{
		Before: ptr.String("cursor"),
	})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: manyEdges[1:100],
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: true,
			StartCursor:     "cursor",
			EndCursor:       "cursor",
		},
	}, connection)
}

func TestGetConnectionNoPagination(t *testing.T) {
	zeroEdges := []*modelInputs.LogEdge{}
	manyEdges := []*modelInputs.LogEdge{}
	for i := 1; i <= LogsLimit+1; i++ {
		manyEdges = append(manyEdges, &modelInputs.LogEdge{
			Cursor: "cursor",
		})
	}

	connection := getLogsConnection(zeroEdges, Pagination{})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: zeroEdges,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     false,
			HasPreviousPage: false,
			StartCursor:     "",
			EndCursor:       "",
		},
	}, connection)

	connection = getLogsConnection(manyEdges, Pagination{})

	assert.Equal(t, &modelInputs.LogsConnection{
		Edges: manyEdges[:LogsLimit],
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: false,
			StartCursor:     "cursor",
			EndCursor:       "cursor",
		},
	}, connection)
}

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

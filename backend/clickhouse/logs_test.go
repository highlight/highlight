package clickhouse

import (
	"context"
	"testing"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func setup(t *testing.T) *Client {
	client, err := setupClickhouseTestDB()

	assert.NoError(t, err)

	return client
}

func teardown(client *Client) {
	client.conn.Exec(context.Background(), "TRUNCATE TABLE logs") //nolint:errcheck
}

func makeDateWithinRange(now time.Time) *modelInputs.DateRangeRequiredInput {
	return &modelInputs.DateRangeRequiredInput{
		StartDate: now.Add(-time.Hour * 1),
		EndDate:   now.Add(time.Hour * 1),
	}
}

func TestReadLogsWithTimeQuery(t *testing.T) {
	ctx := context.Background()
	client := setup(t)
	defer teardown(client)

	now := time.Now()
	rows := []*LogRow{
		{
			Timestamp: now,
			ProjectId: 1,
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	logs, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 2),
			EndDate:   now.Add(-time.Hour * 1),
		},
	})
	assert.NoError(t, err)

	assert.Len(t, logs, 0)

	logs, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 1),
			EndDate:   now.Add(time.Hour * 1),
		},
	})
	assert.NoError(t, err)

	assert.Len(t, logs, 1)
}

func TestReadLogsWithBodyFilter(t *testing.T) {
	ctx := context.Background()
	client := setup(t)
	defer teardown(client)

	now := time.Now()
	rows := []*LogRow{
		{
			Timestamp: now,
			ProjectId: 1,
			Body:      "body",
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	logs, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "no match",
	})
	assert.NoError(t, err)
	assert.Len(t, logs, 0)

	logs, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "body",
	})
	assert.NoError(t, err)
	assert.Len(t, logs, 1)

	logs, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "od",
	})
	assert.NoError(t, err)
	assert.Len(t, logs, 1)
}

func TestReadLogsWithKeyFilter(t *testing.T) {
	ctx := context.Background()
	client := setup(t)
	defer teardown(client)

	now := time.Now()
	rows := []*LogRow{
		{
			Timestamp:     now,
			ProjectId:     1,
			LogAttributes: map[string]string{"service": "image processor"},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	logs, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:foo",
	})
	assert.NoError(t, err)
	assert.Len(t, logs, 0)

	logs, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:'image processor'",
	})
	assert.NoError(t, err)
	assert.Len(t, logs, 1)

	logs, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:*mage*",
	})
	assert.NoError(t, err)
	assert.Len(t, logs, 1)
}

func TestLogsKeys(t *testing.T) {
	ctx := context.Background()
	client := setup(t)
	defer teardown(client)

	rows := []*LogRow{
		{
			Timestamp:     time.Now(),
			ProjectId:     1,
			LogAttributes: map[string]string{"user_id": "1", "workspace_id": "2"},
		},
		{
			Timestamp:     time.Now(),
			ProjectId:     1,
			LogAttributes: map[string]string{"workspace_id": "3"},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	keys, err := client.LogsKeys(ctx, 1)
	assert.NoError(t, err)

	expected := []*modelInputs.LogKey{
		{
			Name: "workspace_id", // workspace_id has more hits so it should be ranked higher
			Type: modelInputs.LogKeyTypeString,
		},
		{
			Name: "user_id",
			Type: modelInputs.LogKeyTypeString,
		},
	}
	assert.Equal(t, expected, keys)
}

func TestLogKeys(t *testing.T) {
	ctx := context.Background()
	client := setup(t)
	defer teardown(client)

	rows := []*LogRow{
		{
			Timestamp:     time.Now(),
			ProjectId:     1,
			LogAttributes: map[string]string{"workspace_id": "2"},
		},
		{
			Timestamp:     time.Now(),
			ProjectId:     1,
			LogAttributes: map[string]string{"workspace_id": "3"},
		},
		{
			Timestamp:     time.Now(),
			ProjectId:     1,
			LogAttributes: map[string]string{"workspace_id": "3"},
		},
		{
			Timestamp:     time.Now(),
			ProjectId:     1,
			LogAttributes: map[string]string{"workspace_id": "4"},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	values, err := client.LogsKeyValues(ctx, 1, "workspace_id")
	assert.NoError(t, err)

	expected := []string{"3", "2", "4"}
	assert.Equal(t, expected, values)
}

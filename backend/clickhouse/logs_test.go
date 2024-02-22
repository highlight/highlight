package clickhouse

import (
	"context"
	"fmt"
	"os"
	"reflect"
	"sort"
	"testing"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"

	"github.com/highlight-run/highlight/backend/parser"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func TestMain(m *testing.M) {
	_, err := SetupClickhouseTestDB()
	if err != nil {

		panic("Failed to setup clickhouse test database")
	}
	code := m.Run()
	os.Exit(code)
}

func setupTest(tb testing.TB) (*Client, func(tb testing.TB)) {
	client, _ := NewClient(TestDatabase)

	return client, func(tb testing.TB) {
		err := client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", LogsTable))
		assert.NoError(tb, err)

		err = client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", LogKeysTable))
		assert.NoError(tb, err)

		err = client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", LogKeyValuesTable))
		assert.NoError(tb, err)

		err = client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", TracesTable))
		assert.NoError(tb, err)
	}
}

func makeDateWithinRange(now time.Time) *modelInputs.DateRangeRequiredInput {
	return &modelInputs.DateRangeRequiredInput{
		StartDate: now.Add(-time.Hour * 1),
		EndDate:   now.Add(time.Hour * 1),
	}
}

func assertCursorsOutput(t *testing.T, edges []*modelInputs.LogEdge, expectedCursor string) {
	allCursorsUnique := make(map[string]struct{})
	for _, edge := range edges {
		_, ok := allCursorsUnique[edge.Cursor]
		if ok {
			assert.Fail(t, "Cursors are not unique")
		} else {
			allCursorsUnique[edge.Cursor] = struct{}{}
		}
	}

	_, ok := allCursorsUnique[expectedCursor]
	if !ok {
		assert.Fail(t, "Expected cursor is not in the returned output")
	}
}

func TestBatchWriteLogRows(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		NewLogRow(now, 1, WithSource(modelInputs.LogSourceFrontend)),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, modelInputs.LogSourceFrontend.String(), *payload.Edges[0].Node.Source)
}

func TestReadLogsWithTimeQuery(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 2),
			EndDate:   now.Add(-time.Hour * 1),
		},
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 1),
			EndDate:   now.Add(time.Hour * 1),
		},
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, now.Truncate(time.Second).UTC(), payload.Edges[0].Node.Timestamp.UTC())
}

func TestReadLogsAscending(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)
	rows := []*LogRow{
		NewLogRow(now, 1, WithBody(ctx, "Body 1")),
		NewLogRow(oneSecondAgo, 1, WithBody(ctx, "Body 2")),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{
		Direction: modelInputs.SortDirectionAsc,
	})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 2)
	assert.Equal(t, payload.Edges[0].Node.Message, "Body 2")
	assert.Equal(t, payload.Edges[1].Node.Message, "Body 1")
}

func TestReadSessionLogs(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)
	rows := []*LogRow{
		NewLogRow(oneSecondAgo, 1,
			WithBody(ctx, "Body"),
			WithSeverityText(modelInputs.LogLevelInfo.String()),
			WithLogAttributes(map[string]string{"service": "foo"})),
	}

	for i := 1; i <= LogsLimit; i++ {
		rows = append(rows, NewLogRow(now, 1))
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	edges, err := client.ReadSessionLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	})
	assert.NoError(t, err)

	assert.Len(t, edges, LogsLimit+1)
	assert.Equal(t, edges[0].Node.Message, "Body")
	assert.Equal(t, edges[0].Node.Level, modelInputs.LogLevelInfo)

	// assert we aren't loading log attributes which is a large column
	// see: https://github.com/ClickHouse/ClickHouse/issues/7187
	assert.Empty(t, edges[0].Node.LogAttributes)
}

func TestReadLogsTotalCount(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		NewLogRow(now, 1),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	count, err := client.ReadLogsTotalCount(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	})
	assert.NoError(t, err)
	assert.Equal(t, uint64(1), count)
}

func TestReadLogsHistogram(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithSeverityText(modelInputs.LogLevelInfo.String())),
		NewLogRow(now.Add(-time.Hour-time.Minute*29), 1, WithSeverityText(modelInputs.LogLevelDebug.String())),
		NewLogRow(now.Add(-time.Hour-time.Minute*30), 1, WithSeverityText(modelInputs.LogLevelInfo.String())),
		NewLogRow(now.Add(-time.Hour*2), 1, WithSeverityText(modelInputs.LogLevelError.String())),
		NewLogRow(now.Add(-time.Hour*2-time.Minute*30), 1, WithSeverityText(modelInputs.LogLevelError.String())),
		NewLogRow(now.Add(-time.Hour*3), 1, WithSeverityText(modelInputs.LogLevelError.String())),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	nBuckets := 48
	payload, err := client.ReadLogsHistogram(ctx, 1, modelInputs.QueryInput{
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 2),
			EndDate:   now.Add(-time.Hour * 1),
		},
	}, nBuckets)
	assert.NoError(t, err)

	assert.Equal(
		t,
		uint64(nBuckets),
		payload.TotalCount,
		"The total number of buckets should be equal to the number of buckets requested",
	)
	assert.Len(
		t,
		payload.Buckets, 2,
		"Two buckets should be returned",
	)

	assert.Equal(
		t,
		uint64(0),
		payload.Buckets[0].BucketID,
		"The first bucket should have a bucketID of 0",
	)
	assert.Equal(
		t,
		uint64(24),
		payload.Buckets[1].BucketID,
		"The second bucket should have a bucketID of 24",
	)

	assert.Equal(
		t,
		len(modelInputs.AllLogLevel),
		len(payload.Buckets[0].Counts),
		"The first bucket should have a count for each severity",
	)
	assert.Equal(
		t,
		len(modelInputs.AllLogLevel),
		len(payload.Buckets[1].Counts),
		"The second bucket should have a count for each severity",
	)

	assert.Equal(
		t,
		modelInputs.LogLevelError,
		payload.Buckets[0].Counts[4].Level,
		"The first bucket should have the count 4 with severity of ERROR",
	)
	assert.Equal(
		t,
		uint64(1),
		payload.Buckets[0].Counts[4].Count,
		"The first bucket should have a single count with severity ERROR",
	)

	assert.Equal(
		t,
		modelInputs.LogLevelDebug,
		payload.Buckets[1].Counts[1].Level,
		"The second bucket should have the count 1 with severity of DEBUG",
	)
	assert.Equal(
		t,
		uint64(1),
		payload.Buckets[1].Counts[1].Count,
		"The second bucket should have a single count with severity DEBUG",
	)
	assert.Equal(
		t,
		modelInputs.LogLevelInfo,
		payload.Buckets[1].Counts[2].Level,
		"The second bucket should have the second count with severity of INFO",
	)
	assert.Equal(
		t,
		uint64(1),
		payload.Buckets[1].Counts[2].Count,
		"The second bucket should have a single count with severity INFO",
	)

}

func TestReadLogsHasNextPage(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	var rows []*LogRow

	for i := 1; i <= LogsLimit; i++ {
		rows = append(rows, NewLogRow(now, 1))
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 50)
	assert.False(t, payload.PageInfo.HasNextPage)

	// Add another row to have >50 rows
	assert.NoError(t, client.BatchWriteLogRows(ctx, []*LogRow{NewLogRow(now, 1)}))

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 50)
	assert.True(t, payload.PageInfo.HasNextPage)

	// We had a bug where we could potentially return >50 rows if there were
	// duplicate in the result set. This test repro'd that bug.
	duplicateLogRows := []*LogRow{}
	duplicateLogRows = append(duplicateLogRows, rows[0])
	duplicateLogRows = append(duplicateLogRows, rows[2])
	duplicateLogRows = append(duplicateLogRows, rows[4])
	assert.NoError(t, client.BatchWriteLogRows(ctx, duplicateLogRows))

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{After: &payload.Edges[0].Cursor})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 50)
	// Duplicates are removed from the result set so this should be false
	assert.False(t, payload.PageInfo.HasNextPage)
}

func TestReadLogsAfterCursor(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)
	oneDayAgo := now.Add(-time.Hour * 24)

	rows := []*LogRow{
		{
			Timestamp: now,
			ProjectId: 1,
			Body:      "Body 1",
			UUID:      "c051edc8-3749-4e44-8f48-0ea90f3fc3d9",
		},
		{
			Timestamp: oneSecondAgo,
			ProjectId: 1,
			Body:      "Body 2",
			UUID:      "a0d9abd6-7cbf-47de-b211-d16bb0935e04",
		},
		{
			Timestamp: oneSecondAgo,
			ProjectId: 1,
			Body:      "Body 3",
			UUID:      "b6e255ee-049e-4563-bbfe-c33503cde94c",
		},
		{
			Timestamp: oneDayAgo,
			ProjectId: 1,
			Body:      "Body 4",
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	originalConnection, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, originalConnection.Edges, 3)

	assert.Equal(t, originalConnection.Edges[0].Node.Message, "Body 1")
	assert.Equal(t, originalConnection.Edges[1].Node.Message, "Body 3")
	assert.Equal(t, originalConnection.Edges[2].Node.Message, "Body 2")

	connection, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{
		After: &originalConnection.Edges[1].Cursor,
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 1)

	assert.Equal(t, connection.Edges[0].Cursor, originalConnection.Edges[2].Cursor)
}

func TestReadLogsBeforeCursor(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)
	oneDayFromNow := now.Add(time.Hour * 24)

	rows := []*LogRow{
		{
			Timestamp: oneDayFromNow,
			ProjectId: 1,
			Body:      "Body 0",
		},
		{
			Timestamp: now,
			ProjectId: 1,
			Body:      "Body 1",
			UUID:      "c051edc8-3749-4e44-8f48-0ea90f3fc3d9",
		},
		{
			Timestamp: oneSecondAgo,
			ProjectId: 1,
			Body:      "Body 2",
			UUID:      "a0d9abd6-7cbf-47de-b211-d16bb0935e04",
		},
		{
			Timestamp: oneSecondAgo,
			ProjectId: 1,
			Body:      "Body 3",
			UUID:      "b6e255ee-049e-4563-bbfe-c33503cde94c",
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	originalConnection, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, originalConnection.Edges, 3)

	assert.Equal(t, originalConnection.Edges[0].Node.Message, "Body 1")
	assert.Equal(t, originalConnection.Edges[1].Node.Message, "Body 3")
	assert.Equal(t, originalConnection.Edges[2].Node.Message, "Body 2")

	connection, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{
		Before: &originalConnection.Edges[1].Cursor,
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 1)

	assert.Equal(t, connection.Edges[0].Cursor, originalConnection.Edges[0].Cursor)
}

func TestReadLogsAtCursor(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{}

	// LogsLimit+3 = 53
	// 1 log not visible on the previous page
	// 51 logs visible (25 before + 25 after + permalinked log)
	// 1 log not visible on the next page
	for i := 1; i <= LogsLimit+3; i++ {
		rows = append(rows, NewLogRow(now, 1))
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	// Load the initial page with no pagination
	originalConnection, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, originalConnection.Edges, 50)

	// Permalink the log in the middle ensuring there is a previous and next page
	permalink := originalConnection.Edges[26]
	connection, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{
		At: ptr.String(permalink.Cursor),
	})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 51) // 25 before + 25 after + the permalinked log
	assert.Equal(t, connection.Edges[25], permalink)
	assert.True(t, connection.PageInfo.HasPreviousPage)
	assert.True(t, connection.PageInfo.HasNextPage)
	assertCursorsOutput(t, connection.Edges, permalink.Cursor)

	// Permalink the log before the middle ensuring there is not a previous page but has a next page
	permalink = originalConnection.Edges[25]
	connection, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{
		At: ptr.String(permalink.Cursor),
	})

	assert.NoError(t, err)
	assert.False(t, connection.PageInfo.HasPreviousPage)
	assert.True(t, connection.PageInfo.HasNextPage)
	assertCursorsOutput(t, connection.Edges, permalink.Cursor)

	// Permalink the log after the middle ensuring there is a previous page but no next page
	permalink = originalConnection.Edges[27]
	connection, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{
		At: ptr.String(permalink.Cursor),
	})

	assert.NoError(t, err)
	assert.True(t, connection.PageInfo.HasPreviousPage)
	assert.False(t, connection.PageInfo.HasNextPage)
	assertCursorsOutput(t, connection.Edges, permalink.Cursor)
}

func TestReadLogsWithBodyFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithBody(ctx, "body with space")),
		NewLogRow(now, 1, WithBody(ctx, "BILLING_ERROR cannot report usage - customer has no subscriptions")),
		NewLogRow(now, 1, WithBody(ctx, "STRIPE-INTEGRATION-ERROR cannot report usage - customer has no subscriptions")),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "no match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "body with space", // direct match
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "*od*", // wildcard match
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "BODY", // case insensitive match
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "BILLING_ERROR", // ensure we escape "_" correctly
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "STRIPE-INTEGRATION-ERROR",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "\"body * space\"", // wildcard match
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
}

func TestReadLogsWithKeyFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"service":      "image processor",
				"workspace_id": "1",
				"user_id":      "1",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"service": "different processor",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"colon_delimited": "foo:bar",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:foo",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     `service:"image processor"`,
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:*mage*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:image* workspace_id:1 user_id:1",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     `service:("image processor" OR "different processor")`,
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithLevelFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithSeverityText(modelInputs.LogLevelInfo.String())),
		NewLogRow(now, 1, WithSeverityText(modelInputs.LogLevelError.String())),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:info",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, modelInputs.LogLevelInfo, payload.Edges[0].Node.Level)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:*nf*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, modelInputs.LogLevelInfo, payload.Edges[0].Node.Level)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:warn",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:(error OR info)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithSessionIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithSecureSessionID("match")),
		NewLogRow(now, 1, WithSecureSessionID("another")),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"secure_session_id": "no_match",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SecureSessionID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:*atc*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SecureSessionID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:no_match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:(match OR another)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithSpanIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithSpanID("match")),
		NewLogRow(now, 1, WithSpanID("another")),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"span_id": "no_match",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SpanID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:*atc*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SpanID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:no_match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:(match OR another)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithTraceIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithTraceID("match")),
		NewLogRow(now, 1, WithTraceID("another")),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"trace_id": "no_match",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.TraceID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:*atc*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.TraceID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:no_match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:(match OR another)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithSourceFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1),
		NewLogRow(now, 1, WithSource(modelInputs.LogSourceBackend)),
		NewLogRow(now, 1, WithSource(modelInputs.LogSourceFrontend)),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"source": "backend",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "source:backend",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "backend", *payload.Edges[0].Node.Source)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "source:*ack*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "backend", *payload.Edges[0].Node.Source)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "source:(frontend OR backend)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithServiceNameFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1),
		NewLogRow(now, 1, WithServiceName("bar")),
		NewLogRow(now, 1, WithServiceName("foo")),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"service_name": "bar",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service_name:bar",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "bar", *payload.Edges[0].Node.ServiceName)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service_name:*a*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "bar", *payload.Edges[0].Node.ServiceName)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service_name=(bar OR foo)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithServiceVersionFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1),
		NewLogRow(now, 1, WithServiceVersion("abc123")),
		NewLogRow(now, 1, WithServiceVersion("xyz456")),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"service_version": "abc123",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service_version:abc123",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "abc123", *payload.Edges[0].Node.ServiceVersion)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service_version:*bc1*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "abc123", *payload.Edges[0].Node.ServiceVersion)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service_version=(abc123 OR xyz456)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithEnvironmentFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1),
		NewLogRow(now, 1, WithEnvironment("production")),
		NewLogRow(now, 1, WithEnvironment("development")),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"environment": "production",
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:production",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "production", *payload.Edges[0].Node.Environment)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:*dev*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "development", *payload.Edges[0].Node.Environment)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:(production OR development)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithMultipleFilters(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithServiceName("no-match")),
		NewLogRow(now, 1,
			WithServiceName("matched"),
			WithLogAttributes(map[string]string{"code.lineno": "162", "os.type": "linux"})),
		NewLogRow(now, 1,
			WithServiceName("matched"),
			WithLogAttributes(map[string]string{"code.lineno": "163", "os.type": "darwin"})),
		NewLogRow(now, 1, WithServiceName(("no-match"))),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "code.lineno:*62 os.type:linux",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("matched"), payload.Edges[0].Node.ServiceName)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "code.lineno:*63 os.type:linux",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "code.lineno:(*63 OR *62) service_name:matched",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestLogsKeys(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"user_id":      "1",
				"workspace_id": "2",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"workspace_id": "3",
			}),
		),
		NewLogRow(now, 1, WithSource(modelInputs.LogSourceFrontend), WithServiceName("foo-service")),
		NewLogRow(now.Add(-time.Second*1), 1, // out of range, should not be included
			WithLogAttributes(map[string]string{
				"workspace_id": "5",
			}),
		),
	}

	searchKey := "s"
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))
	keys, err := client.LogsKeys(ctx, 1, now, now, &searchKey, nil)
	assert.NoError(t, err)

	expected := []*modelInputs.QueryKey{
		{
			Name: "workspace_id", // workspace_id has more hits so it should be ranked higher
			Type: "Numeric",
		},
		{
			Name: "service_name",
			Type: "String",
		},
		{
			Name: "source",
			Type: "String",
		},
		{
			Name: "user_id",
			Type: "Numeric",
		},
		{
			Name: "secure_session_id",
			Type: "String",
		},
		{
			Name: "span_id",
			Type: "String",
		},
		{
			Name: "message",
			Type: "String",
		},
	}
	assert.Equal(t, expected, keys)
}

func TestLogKeyValues(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"workspace_id": "2",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"workspace_id": "2",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"workspace_id": "3",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"workspace_id": "3",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"workspace_id": "3",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"workspace_id": "4",
			}),
		),
		NewLogRow(now.Add(-48*time.Hour), 1, // out of range, should not be included
			WithLogAttributes(map[string]string{
				"workspace_id": "5",
			}),
		),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"unrelated_key": "value",
			}),
		),
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	values, err := client.LogsKeyValues(ctx, 1, "workspace_id", now, now)
	assert.NoError(t, err)

	expected := []string{"3", "2", "4"}

	// Order is not guaranteed (see #4369)
	sort.Strings(values)
	sort.Strings(expected)

	assert.Equal(t, expected, values)
}

func TestLogKeyValuesLevel(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		NewLogRow(now, 1, WithSeverityText(modelInputs.LogLevelInfo.String())),
		NewLogRow(now, 1, WithSeverityText(modelInputs.LogLevelWarn.String())),
		NewLogRow(now, 1, WithSeverityText(modelInputs.LogLevelInfo.String())),
		NewLogRow(now, 1,
			WithLogAttributes(map[string]string{
				"level": modelInputs.LogLevelFatal.String(), // should be skipped in the output
			}),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	values, err := client.LogsKeyValues(ctx, 1, "level", now, now)
	assert.NoError(t, err)

	expected := []string{"info", "warn"}

	sort.Strings(values)
	sort.Strings(expected)

	assert.Equal(t, expected, values)
}

func TestExpandJSON(t *testing.T) {
	var tests = []struct {
		logAttributes map[string]string
		want          map[string]interface{}
	}{
		{map[string]string{"workspace_id": "2"}, map[string]interface{}{"workspace_id": "2"}},
		{map[string]string{"nested.json": "value"}, map[string]interface{}{
			"nested": map[string]interface{}{
				"json": "value",
			},
		}},
		{map[string]string{"nested.foo": "value", "nested.level.bar": "value", "toplevel": "value"}, map[string]interface{}{
			"nested": map[string]interface{}{
				"foo": "value",
				"level": map[string]interface{}{
					"bar": "value",
				},
			},
			"toplevel": "value",
		}},
	}

	for _, tt := range tests {
		testname := fmt.Sprintf("logAttributes: %s", tt.logAttributes)
		t.Run(testname, func(t *testing.T) {
			got := expandJSON(tt.logAttributes)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("got %s, want %s", got, tt.want)
			}
		})
	}
}

func TestBadInput(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	testcases := []string{"\"asdf': asdf\""}

	for _, userInput := range testcases {
		_, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
			DateRange: makeDateWithinRange(now),
			Query:     userInput,
		}, Pagination{})
		assert.NoError(t, err)
	}
}

func FuzzReadLogs(f *testing.F) {
	ctx := context.Background()
	client, teardown := setupTest(f)
	defer teardown(f)

	now := time.Now()

	f.Fuzz(func(t *testing.T, userInput string) {
		_, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
			DateRange: makeDateWithinRange(now),
			Query:     userInput,
		}, Pagination{})
		assert.NoErrorf(t, err, "userInput: %s", userInput)
	})
}

func Test_LogMatchesQuery(t *testing.T) {
	logRow := LogRow{}
	filters := parser.Parse("hello world os.type:linux resource_name:worker.* service_name:all", LogsTableConfig)
	matches := LogMatchesQuery(&logRow, filters)
	assert.False(t, matches)

	logRow = LogRow{
		Body:        "this, is.a ; hello; world \nbe\xe2\x80\x83me",
		ServiceName: "all",
		LogAttributes: map[string]string{
			"os.type":       "linux",
			"resource_name": "worker.kafka.process",
		},
	}
	filters = parser.Parse("hello world be me os.type:linux resource_name:worker.* service_name:all", LogsTableConfig)
	matches = LogMatchesQuery(&logRow, filters)
	assert.True(t, matches)

	filters = parser.Parse("not this one os.type:linux resource_name:worker.* service_name:all", LogsTableConfig)
	matches = LogMatchesQuery(&logRow, filters)
	assert.False(t, matches)

	filters = parser.Parse("os.type:-linux", LogsTableConfig)
	matches = LogMatchesQuery(&logRow, filters)
	assert.False(t, matches)
}

func Test_LogMatchesQuery_Body(t *testing.T) {
	for _, body := range []string{
		"hello world a test",
		"hello, world this is a test",
		"0!0!  0*000000 000000000",
		"0! 000\\\"0000000000000",
		"(*",
		"*!",
		"*\\x80",
	} {
		logRow := LogRow{Body: body}
		filters := parser.Parse(body, LogsTableConfig)
		matches := LogMatchesQuery(&logRow, filters)
		assert.True(t, matches, "failed on body %s", body)

		filters = parser.Parse("no", LogsTableConfig)
		matches = LogMatchesQuery(&logRow, filters)
		assert.False(t, matches, "failed on body %s", body)
	}
}

func Test_LogMatchesQuery_ClickHouse(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)
	var rows []*LogRow
	for i := 1; i <= LogsLimit; i++ {
		row := NewLogRow(oneSecondAgo, 1,
			WithBody(ctx, "this is a hello world message"),
			WithSeverityText(modelInputs.LogLevelInfo.String()),
			WithServiceName("all"),
			WithTraceID(uuid.New().String()),
			WithLogAttributes(map[string]string{
				"service":       "foo",
				"os.type":       "linux",
				"resource_name": "worker.kafka.process"}))
		if i < 10 {
			row.ServiceName = "dev"
		}
		rows = append(rows, row)
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	query := "hello world os.type:linux resource_name:worker.* service_name:dev"
	result, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     query,
	}, Pagination{})
	assert.NoError(t, err)

	var filtered []*LogRow
	filters := parser.Parse(query, LogsTableConfig)
	for _, logRow := range rows {
		if LogMatchesQuery(logRow, filters) {
			filtered = append(filtered, logRow)
		}
	}

	assert.Equal(t, len(filtered), len(result.Edges))
	for _, logRow := range filtered {
		_, found := lo.Find(result.Edges, func(edge *modelInputs.LogEdge) bool {
			if edge.Node.TraceID == nil {
				return false
			}
			return *edge.Node.TraceID == logRow.TraceId
		})
		assert.True(t, found)
	}
}

func Test_ReadLogsWithMultipleAttributeFilters_Clickhouse(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)
	var rows []*LogRow
	for i := 1; i <= 10; i++ {
		row := NewLogRow(oneSecondAgo, 1,
			WithBody(ctx, "this is a test"),
			WithSeverityText(modelInputs.LogLevelInfo.String()),
			WithServiceName(string(modelInputs.LogSourceFrontend)),
			WithTraceID(uuid.New().String()),
			WithLogAttributes(map[string]string{
				"os": "linux",
			}))

		row.LogAttributes["os"] = fmt.Sprintf("linux-%d", i)

		rows = append(rows, row)
	}

	err := client.BatchWriteLogRows(ctx, rows)
	assert.NoError(t, err)

	// Test OR query
	query := "os:(linux-1 OR linux-2)"
	params := modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     query,
	}
	conn, err := client.ReadLogs(ctx, 1, params, Pagination{})
	assert.NoError(t, err)
	assert.Equal(t, 2, len(conn.Edges))
	possibleValues := []string{"linux-1", "linux-2"}
	for _, edge := range conn.Edges {
		assert.Contains(t, possibleValues, edge.Node.LogAttributes["os"])
	}

	// Test AND + NOT query
	query = "os=linux-* os!=linux-4"
	params = modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     query,
	}
	conn, err = client.ReadLogs(ctx, 1, params, Pagination{})
	assert.NoError(t, err)
	assert.Equal(t, 9, len(conn.Edges))
	for _, edge := range conn.Edges {
		assert.NotEqual(t, "linux-4", edge.Node.LogAttributes["os"])
	}
}

func Test_LogMatchesNotQuery_ClickHouse(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)
	var rows []*LogRow
	for i := 1; i <= 10; i++ {
		row := NewLogRow(oneSecondAgo, 1,
			WithBody(ctx, "this is a hello world message"),
			WithSeverityText(modelInputs.LogLevelInfo.String()),
			WithServiceName(string(modelInputs.LogSourceFrontend)),
			WithTraceID(uuid.New().String()),
			WithLogAttributes(map[string]string{
				"os.type": "linux",
			}))

		row.ServiceName = fmt.Sprintf("frontend-%d", i)
		row.LogAttributes["os.type"] = fmt.Sprintf("linux-%d", i)

		rows = append(rows, row)
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	query := "service_name=frontend-* service_name!=frontend-2 service_name!=frontend-4 os.type:linu* os.type!=linux-3 os.type!=linux-5"
	result, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     query,
	}, Pagination{})
	assert.NoError(t, err)

	assert.Equal(t, 6, len(result.Edges))
	for _, edge := range result.Edges {
		assert.NotEqual(t, "frontend-2", *edge.Node.ServiceName)
		assert.NotEqual(t, "frontend-4", *edge.Node.ServiceName)
		assert.NotEqual(t, "linux-3", edge.Node.LogAttributes["os.type"])
		assert.NotEqual(t, "linux-5", edge.Node.LogAttributes["os.type"])
	}
}

func Test_LogMatchesQuery_ClickHouse_Body(t *testing.T) {
	for _, body := range []string{
		"hello world",
		"this, is.a ; hello; \nbe  me",
		"hello world a test",
		"hello, world this is a test",
		"foo*bar",
		"(*",
		"*!",
		"*\\x80",
	} {
		ctx := context.Background()
		client, teardown := setupTest(t)
		defer teardown(t)

		now := time.Now()
		oneSecondAgo := now.Add(-time.Second * 1)
		logRow := NewLogRow(oneSecondAgo, 1, WithBody(ctx, body))
		assert.NoError(t, client.BatchWriteLogRows(ctx, []*LogRow{logRow}))

		result, err := client.ReadLogs(ctx, 1, modelInputs.QueryInput{
			DateRange: makeDateWithinRange(now),
			Query:     "\"" + body + "\"",
		}, Pagination{})
		assert.NoError(t, err)

		var filtered []*LogRow
		filters := parser.Parse(body, LogsTableConfig)
		if LogMatchesQuery(logRow, filters) {
			filtered = append(filtered, logRow)
		}

		assert.Equal(t, 1, len(result.Edges))
		assert.Equal(t, len(filtered), len(result.Edges))
		_, found := lo.Find(result.Edges, func(edge *modelInputs.LogEdge) bool {
			if edge.Node.TraceID == nil {
				return false
			}
			return *edge.Node.TraceID == logRow.TraceId
		})
		assert.True(t, found)
	}
}

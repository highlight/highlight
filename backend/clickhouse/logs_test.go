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
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	_, err := setupClickhouseTestDB()
	if err != nil {
		panic("Failed to setup clickhouse test database")
	}
	code := m.Run()
	// teardown() - we could drop the testing database here
	os.Exit(code)
}

func setupTest(tb testing.TB) (*Client, func(tb testing.TB)) {
	client, _ := NewClient(TestDatabase)

	return client, func(tb testing.TB) {
		err := client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", LogsTable))
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

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 2),
			EndDate:   now.Add(-time.Hour * 1),
		},
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{
		Direction: modelInputs.LogDirectionAsc,
	})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 2)
	assert.Equal(t, payload.Edges[0].Node.Message, "Body 2")
	assert.Equal(t, payload.Edges[1].Node.Message, "Body 1")
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

	count, err := client.ReadLogsTotalCount(ctx, 1, modelInputs.LogsParamsInput{
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
	payload, err := client.ReadLogsHistogram(ctx, 1, modelInputs.LogsParamsInput{
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

	for i := 1; i <= LogsLimit; i++ { // 100 is a hardcoded limit
		rows = append(rows, NewLogRow(now, 1))
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 50)
	assert.False(t, payload.PageInfo.HasNextPage)

	// Add more more row to have 101 rows
	assert.NoError(t, client.BatchWriteLogRows(ctx, []*LogRow{
		NewLogRow(now, 1),
	}))

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)

	assert.True(t, payload.PageInfo.HasNextPage)
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

	originalConnection, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, originalConnection.Edges, 3)

	assert.Equal(t, originalConnection.Edges[0].Node.Message, "Body 1")
	assert.Equal(t, originalConnection.Edges[1].Node.Message, "Body 3")
	assert.Equal(t, originalConnection.Edges[2].Node.Message, "Body 2")

	connection, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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

	originalConnection, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, originalConnection.Edges, 3)

	assert.Equal(t, originalConnection.Edges[0].Node.Message, "Body 1")
	assert.Equal(t, originalConnection.Edges[1].Node.Message, "Body 3")
	assert.Equal(t, originalConnection.Edges[2].Node.Message, "Body 2")

	connection, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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
	originalConnection, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, Pagination{})
	assert.NoError(t, err)

	assert.Len(t, originalConnection.Edges, 50)

	// Permalink the log in the middle ensuring there is a previous and next page
	permalink := originalConnection.Edges[26]
	connection, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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
	connection, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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
	connection, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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
		NewLogRow(now, 1, WithBody(ctx, "STRIPE_INTEGRATION_ERROR cannot report usage - customer has no subscriptions")),
		NewLogRow(now, 1, WithBody(ctx, "STRIPE-INTEGRATION-ERROR cannot report usage - customer has no subscriptions")),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "no match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "body with space", // direct match
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "*od*", // wildcard match
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "BODY", // case insensitive match
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "STRIPE_INTEGRATION_ERROR", // uses reserved separator character
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "STRIPE-INTEGRATION-ERROR", // uses reserved separator character
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadLogsWithKeyFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	var resourceAttributes, spanAttributes, eventAttributes map[string]any
	resourceAttributes = map[string]any{
		"service":      "image processor",
		"workspace_id": "1",
		"user_id":      "1",
	}
	rows := []*LogRow{
		NewLogRow(now, 1,
			WithLogAttributes(ctx, resourceAttributes, spanAttributes, eventAttributes, false),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:foo",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     `service:"image processor"`,
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:*mage*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:image* workspace_id:1 user_id:1",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
}

func TestReadLogsWithLevelFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithSeverityText(modelInputs.LogLevelInfo.String())),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"level": modelInputs.LogLevelWarn.String(),
			}, map[string]any{}, map[string]any{}, false),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:info",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, modelInputs.LogLevelInfo, payload.Edges[0].Node.Level)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:*nf*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, modelInputs.LogLevelInfo, payload.Edges[0].Node.Level)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:warn",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestReadLogsWithSessionIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithSecureSessionID("match")),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"secure_session_id": "no_match",
			}, map[string]any{}, map[string]any{}, false),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SecureSessionID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:*atc*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SecureSessionID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:no_match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestReadLogsWithSpanIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithSpanID("match")),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"span_id": "no_match",
			}, map[string]any{}, map[string]any{}, false),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SpanID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:*atc*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SpanID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:no_match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestReadLogsWithTraceIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1, WithTraceID("match")),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"trace_id": "no_match",
			}, map[string]any{}, map[string]any{}, false),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.TraceID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:*atc*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.TraceID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:no_match",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestReadLogsWithSourceFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		NewLogRow(now, 1),
		NewLogRow(now, 1, WithSource(modelInputs.LogSourceBackend), WithServiceName("bar")),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"source": "frontend",
			}, map[string]any{}, map[string]any{}, false),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service_name:bar source:backend",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "backend", *payload.Edges[0].Node.Source)
	assert.Equal(t, "bar", *payload.Edges[0].Node.ServiceName)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "source:*ack*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "backend", *payload.Edges[0].Node.Source)
	assert.Equal(t, "bar", *payload.Edges[0].Node.ServiceName)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "source:frontend",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestLogsKeys(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"user_id":      "1",
				"workspace_id": "2",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "3",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1, WithSource(modelInputs.LogSourceFrontend), WithServiceName("foo-service")),
		NewLogRow(now.Add(-time.Second*1), 1, // out of range, should not be included
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "5",
			}, map[string]any{}, map[string]any{}, false),
		),
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	keys, err := client.LogsKeys(ctx, 1, now, now)
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

		// Non-custom keys ranked lower
		{
			Name: "level",
			Type: modelInputs.LogKeyTypeString,
		},
		{
			Name: "message",
			Type: modelInputs.LogKeyTypeString,
		},
		{
			Name: "secure_session_id",
			Type: modelInputs.LogKeyTypeString,
		},
		{
			Name: "span_id",
			Type: modelInputs.LogKeyTypeString,
		},
		{
			Name: "trace_id",
			Type: modelInputs.LogKeyTypeString,
		},
		{
			Name: "source",
			Type: modelInputs.LogKeyTypeString,
		},
		{
			Name: "service_name",
			Type: modelInputs.LogKeyTypeString,
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
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "2",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "2",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "3",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "3",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "3",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "4",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now.Add(-time.Second*1), 1, // out of range, should not be included
			WithLogAttributes(ctx, map[string]any{
				"workspace_id": "5",
			}, map[string]any{}, map[string]any{}, false),
		),
		NewLogRow(now, 1,
			WithLogAttributes(ctx, map[string]any{
				"unrelated_key": "value",
			}, map[string]any{}, map[string]any{}, false),
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
			WithLogAttributes(ctx, map[string]any{
				"level": modelInputs.LogLevelFatal.String(), // should be skipped in the output
			}, map[string]any{}, map[string]any{}, false),
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
		_, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
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
		_, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
			DateRange: makeDateWithinRange(now),
			Query:     userInput,
		}, Pagination{})
		assert.NoError(t, err)
	})
}

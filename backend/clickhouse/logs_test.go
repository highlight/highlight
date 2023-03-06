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
		client.conn.Exec(context.Background(), "TRUNCATE TABLE logs") //nolint:errcheck
	}
}

func makeDateWithinRange(now time.Time) *modelInputs.DateRangeRequiredInput {
	return &modelInputs.DateRangeRequiredInput{
		StartDate: now.Add(-time.Hour * 1),
		EndDate:   now.Add(time.Hour * 1),
	}
}

func TestReadLogsWithTimeQuery(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

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
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 2),
			EndDate:   now.Add(-time.Hour * 1),
		},
	}, nil)
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: now.Add(-time.Hour * 1),
			EndDate:   now.Add(time.Hour * 1),
		},
	}, nil)
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 1)
}

func TestReadLogsHistogram(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			SeverityText: "INFO",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now.Add(-time.Hour - time.Minute*29),
				ProjectId: 1,
			},
			SeverityText: "DEBUG",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now.Add(-time.Hour - time.Minute*30),
				ProjectId: 1,
			},
			SeverityText: "INFO",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now.Add(-time.Hour * 2),
				ProjectId: 1,
			},
			SeverityText: "ERROR",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now.Add(-time.Hour*2 - time.Minute*30),
				ProjectId: 1,
			},
			SeverityText: "ERROR",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now.Add(-time.Hour * 3),
				ProjectId: 1,
			},
			SeverityText: "ERROR",
		},
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
		modelInputs.LogLevel("ERROR"),
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
		modelInputs.LogLevel("DEBUG"),
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
		modelInputs.LogLevel("INFO"),
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

	for i := 1; i <= Limit; i++ { // 100 is a hardcoded limit
		rows = append(rows, &LogRow{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
		})
	}
	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, nil)
	assert.NoError(t, err)

	assert.Len(t, payload.Edges, 100)
	assert.False(t, payload.PageInfo.HasNextPage)

	// Add more more row to have 101 rows
	assert.NoError(t, client.BatchWriteLogRows(ctx, []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
		},
	}))

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, nil)
	assert.NoError(t, err)

	assert.True(t, payload.PageInfo.HasNextPage)
}

func TestReadLogsAfterCursor(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	oneSecondAgo := now.Add(-time.Second * 1)

	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			UUID: "c051edc8-3749-4e44-8f48-0ea90f3fc3d9",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: oneSecondAgo,
				ProjectId: 1,
			},
			UUID: "a0d9abd6-7cbf-47de-b211-d16bb0935e04",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: oneSecondAgo,
				ProjectId: 1,
			},
			UUID: "b6e255ee-049e-4563-bbfe-c33503cde94c",
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 3)

	firstCursor := encodeCursor(now, "c051edc8-3749-4e44-8f48-0ea90f3fc3d9")
	secondCursor := encodeCursor(oneSecondAgo, "b6e255ee-049e-4563-bbfe-c33503cde94c")
	thirdCursor := encodeCursor(oneSecondAgo, "a0d9abd6-7cbf-47de-b211-d16bb0935e04")

	assert.Equal(t, payload.Edges[0].Cursor, firstCursor)
	assert.Equal(t, payload.Edges[1].Cursor, secondCursor)
	assert.Equal(t, payload.Edges[2].Cursor, thirdCursor)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
	}, &secondCursor)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	assert.Equal(t, payload.Edges[0].Cursor, thirdCursor)
}

func TestReadLogsWithBodyFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			Body: "body",
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "no match",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "body", // direct match
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "od", // wildcard match
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "BODY", // case insensitive match
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
}

func TestReadLogsWithKeyFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{
				"service":      "image processor",
				"workspace_id": "1",
				"user_id":      "1",
			},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:foo",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     `service:"image processor"`,
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:*mage*",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "service:image* workspace_id:1 user_id:1",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
}

func TestReadLogsWithLevelFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			SeverityText: "INFO",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{
				"level": "WARN",
			},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:INFO",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, modelInputs.LogLevel("INFO"), payload.Edges[0].Node.Level)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:*NF*",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, modelInputs.LogLevel("INFO"), payload.Edges[0].Node.Level)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "level:WARN",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestReadLogsWithSessionIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp:       now,
				ProjectId:       1,
				SecureSessionId: "match",
			},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{
				"secure_session_id": "no_match",
			},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:match",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SecureSessionID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:*atc*",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SecureSessionID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "secure_session_id:no_match",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestReadLogsWithSpanIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
				SpanId:    "match",
			},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{
				"span_id": "no_match",
			},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:match",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SpanID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:*atc*",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.SpanID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "span_id:no_match",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestReadLogsWithTraceIdFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
				TraceId:   "match",
			},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{
				"trace_id": "no_match",
			},
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	payload, err := client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:match",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.TraceID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:*atc*",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, ptr.String("match"), payload.Edges[0].Node.TraceID)

	payload, err = client.ReadLogs(ctx, 1, modelInputs.LogsParamsInput{
		DateRange: makeDateWithinRange(now),
		Query:     "trace_id:no_match",
	}, nil)
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 0)
}

func TestLogsKeys(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: time.Now(),
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"user_id": "1", "workspace_id": "2"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: time.Now(),
				ProjectId: 1,
			},
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

		// Non-custom keys ranked lower
		{
			Name: "level",
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
	}
	assert.Equal(t, expected, keys)
}

func TestLogKeyValues(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*LogRow{
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"workspace_id": "2"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"workspace_id": "2"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"workspace_id": "3"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"workspace_id": "3"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"workspace_id": "3"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"workspace_id": "4"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now.Add(-time.Second * 1), // out of range, should not be included
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"workspace_id": "5"},
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"unrelated_key": "value"},
		},
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
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			SeverityText: "INFO",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			SeverityText: "WARN",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			SeverityText: "INFO",
		},
		{
			LogRowPrimaryAttrs: LogRowPrimaryAttrs{
				Timestamp: now,
				ProjectId: 1,
			},
			LogAttributes: map[string]string{"level": "FATAL"}, // should be skipped in the output
		},
	}

	assert.NoError(t, client.BatchWriteLogRows(ctx, rows))

	values, err := client.LogsKeyValues(ctx, 1, "level", now, now)
	assert.NoError(t, err)

	expected := []string{"INFO", "WARN"}

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

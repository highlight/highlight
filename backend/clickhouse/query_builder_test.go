package clickhouse

import (
	"fmt"
	"testing"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/require"
)

func TestBuildWhereClause(t *testing.T) {
	projectID := 1
	startDate, err := time.Parse(time.RFC3339Nano, "2023-01-04T13:38:00.000000000-07:00")
	require.NoError(t, err)

	endDate := startDate.Add(-time.Hour * 24)

	var tests = []struct {
		params modelInputs.LogsParamsInput
		want   string
	}{
		{modelInputs.LogsParamsInput{
			Query: "",
			DateRange: &modelInputs.DateRangeRequiredInput{
				StartDate: startDate,
				EndDate:   endDate,
			},
		}, "WHERE ProjectId = 1 AND toUInt64(toDateTime(Timestamp)) >= 1672864680 AND toUInt64(toDateTime(Timestamp)) <= 1672778280"},
		{modelInputs.LogsParamsInput{
			Query: "workspace_id:1",
			DateRange: &modelInputs.DateRangeRequiredInput{
				StartDate: startDate,
				EndDate:   endDate,
			},
		}, "WHERE ProjectId = 1 AND toUInt64(toDateTime(Timestamp)) >= 1672864680 AND toUInt64(toDateTime(Timestamp)) <= 1672778280 AND LogAttributes['workspace_id'] = '1'"},
	}

	for _, tt := range tests {
		testname := fmt.Sprintf("params: %v", tt.params)
		t.Run(testname, func(t *testing.T) {
			got := buildWhereClause(projectID, tt.params)
			if got != tt.want {
				t.Errorf("got %s, want %s", got, tt.want)
			}
		})
	}
}

func TestBuildLogAttributes(t *testing.T) {
	var tests = []struct {
		query string
		want  string
	}{
		{"", ""},
		{"workspace_id:1", "LogAttributes['workspace_id'] = '1'"},
		{"user_id:1", "LogAttributes['user_id'] = '1'"},
		{"workspace_id:1 user_id:1", "LogAttributes['workspace_id'] = '1' AND LogAttributes['user_id'] = '1'"},
	}

	for _, tt := range tests {
		testname := fmt.Sprintf("query: %s", tt.query)
		t.Run(testname, func(t *testing.T) {
			got := buildLogAttributes(tt.query)
			if got != tt.want {
				t.Errorf("got %s, want %s", got, tt.want)
			}
		})
	}
}

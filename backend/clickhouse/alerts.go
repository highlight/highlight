package clickhouse

import (
	"context"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
)

const AlertStateChangesTable = "alert_state_changes"
const MetricHistoryTable = "metric_history"
const AlertHistoryMaxLookback = 2 * time.Hour

func (client *Client) ReadAlertStateChanges(ctx context.Context, projectId int, alertId int, startDate time.Time, endDate time.Time) ([]modelInputs.AlertStateChange, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.From(AlertStateChangesTable)
	sb.Where(sb.Equal("ProjectID", projectId))
	sb.Where(sb.Equal("AlertID", alertId))
	sb.Where(sb.GreaterEqualThan("Timestamp", startDate))
	sb.Where(sb.LessEqualThan("Timestamp", endDate))
	sb.OrderBy("Timestamp DESC")

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	results := []modelInputs.AlertStateChange{}
	for rows.Next() {
		var result modelInputs.AlertStateChange
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}
		results = append(results, result)
	}

	return results, nil
}

type SavedMetricState struct {
	AlertId         int
	BlockNumberInfo []BlockNumberInfo
}

type BlockNumberInfo struct {
	Partition       string
	LastBlockNumber int
}

func (client *Client) GetBlockNumbers(ctx context.Context, metricId int, endDate time.Time) ([]BlockNumberInfo, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("toString(toDate(date_trunc('day', Timestamp)))",
		"maxMerge(MaxBlockNumberState)")
	sb.From(MetricHistoryTable)
	sb.Where(sb.Equal("MetricId", metricId))
	sb.Where(sb.GreaterEqualThan("Timestamp", endDate.Add(-AlertHistoryMaxLookback)))
	sb.Where(sb.LessEqualThan("Timestamp", endDate))
	sb.GroupBy("1")

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	var results []BlockNumberInfo
	for rows.Next() {
		var result BlockNumberInfo
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}
		results = append(results, result)
	}

	return results, nil
}

func (client *Client) AggregateMetricStates(ctx context.Context, metricId int, endDate time.Time) (uint64, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("maxMerge(MaxBlockNumberState)")
	sb.From(MetricHistoryTable)
	sb.Where(sb.Equal("MetricId", metricId))
	sb.Where(sb.GreaterEqualThan("Timestamp", endDate.Add(-AlertHistoryMaxLookback)))
	sb.Where(sb.LessEqualThan("Timestamp", endDate))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return 0, err
	}

	var result uint64
	for rows.Next() {
		if err := rows.ScanStruct(&result); err != nil {
			return 0, err
		}
	}

	return result, nil
}

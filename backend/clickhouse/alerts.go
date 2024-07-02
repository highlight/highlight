package clickhouse

import (
	"context"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
)

const AlertStateChangesTable = "alert_state_changes"
const AlertMetricHistoryTable = "alert_metric_history"
const AlertHistoryMaxLookback = 2 * time.Hour

type AlertMetricHistory struct {
	AlertID    int
	GroupByKey string
	Timestamp  time.Time
	Value      float64
}

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

func (client *Client) GetMaxBlockId(ctx context.Context, alertId int, endDate time.Time) (uint64, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("maxMerge(MaxBlockNumberState)")
	sb.From(AlertMetricHistoryTable)
	sb.Where(sb.Equal("AlertID", alertId))
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

func (client *Client) AggregateAlertStates(ctx context.Context, alertId int, endDate time.Time) (uint64, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("maxMerge(MaxBlockNumberState)")
	sb.From(AlertMetricHistoryTable)
	sb.Where(sb.Equal("AlertID", alertId))
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

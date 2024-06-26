package clickhouse

import (
	"context"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
)

const AlertStateChanges = "alert_state_changes"

func (client *Client) ReadAlertStateChanges(ctx context.Context, projectId int, alertId int, startDate time.Time, endDate time.Time) ([]modelInputs.AlertStateChange, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.From(AlertStateChanges)
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

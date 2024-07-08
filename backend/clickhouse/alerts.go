package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
)

const AlertStateChangesTable = "alert_state_changes"

func (client *Client) GetLastAlertingStates(ctx context.Context, projectId int, alertId int, startDate time.Time, endDate time.Time) ([]modelInputs.AlertStateChange, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("GroupByKey", "max(asc.Timestamp) as Timestamp")
	sb.From(fmt.Sprintf("%s asc", AlertStateChangesTable))
	sb.Where(sb.Equal("ProjectID", projectId))
	sb.Where(sb.Equal("AlertID", alertId))
	sb.Where(sb.Equal("State", modelInputs.AlertStateAlerting))
	sb.Where(sb.GreaterEqualThan("asc.Timestamp", startDate))
	sb.Where(sb.LessEqualThan("asc.Timestamp", endDate))
	sb.GroupBy("1")

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
		result.AlertID = alertId
		result.State = modelInputs.AlertStateAlerting
		results = append(results, result)
	}

	return results, nil
}

func (client *Client) WriteAlertStateChanges(ctx context.Context, projectId int, alertStates []modelInputs.AlertStateChange) error {
	if len(alertStates) == 0 {
		return nil
	}

	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))

	ib := sqlbuilder.
		NewStruct(new(modelInputs.AlertStateChange)).
		InsertInto(AlertStateChangesTable).
		Cols("ProjectID", "AlertID", "Timestamp", "State", "GroupByKey")

	for _, state := range alertStates {
		ib.Values(projectId, state.AlertID, state.Timestamp, state.State, state.GroupByKey)
	}

	sql, args := ib.BuildWithFlavor(sqlbuilder.ClickHouse)

	return client.conn.Exec(chCtx, sql, args...)
}

package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
)

const AlertStateChangesTable = "alert_state_changes"

type AlertStateChangeRow struct {
	UUID       string
	ProjectID  uint32
	AlertID    uint32
	Timestamp  time.Time
	State      string
	GroupByKey string
}

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

func (client *Client) GetAlertingAlertStateChanges(ctx context.Context, projectId int, alertId int, startDate time.Time, endDate time.Time, pageParam *int, countParam *int) ([]*modelInputs.AlertStateChange, int64, error) {
	page := 1
	if pageParam != nil {
		page = *pageParam
	}
	count := 10
	if countParam != nil {
		count = *countParam
	}
	offset := (page - 1) * count

	scanAlertStateChange := func(rows driver.Rows) (*modelInputs.AlertStateChange, error) {
		var result AlertStateChangeRow
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		return &modelInputs.AlertStateChange{
			ProjectID:  int(result.ProjectID),
			AlertID:    int(result.AlertID),
			Timestamp:  result.Timestamp,
			State:      modelInputs.AlertState(result.State),
			GroupByKey: result.GroupByKey,
		}, nil
	}

	totalSb := sqlbuilder.NewSelectBuilder()
	totalSb.Select("count(*) as total").
		From(AlertStateChangesTable).
		Where(totalSb.Equal("ProjectID", projectId)).
		Where(totalSb.Equal("AlertID", alertId)).
		Where(totalSb.Equal("State", modelInputs.AlertStateAlerting)).
		Where(totalSb.GreaterEqualThan("Timestamp", startDate)).
		Where(totalSb.LessEqualThan("Timestamp", endDate))

	totalSql, totalArgs := totalSb.BuildWithFlavor(sqlbuilder.ClickHouse)

	row := client.conn.QueryRow(ctx, totalSql, totalArgs...)
	var totalCount uint64
	if err := row.Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("ProjectID", "AlertID", "Timestamp", "State", "GroupByKey").
		From(AlertStateChangesTable).
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.Equal("AlertID", alertId)).
		Where(sb.Equal("State", modelInputs.AlertStateAlerting)).
		Where(sb.GreaterEqualThan("Timestamp", startDate)).
		Where(sb.LessEqualThan("Timestamp", endDate)).
		OrderBy("Timestamp DESC").
		Offset(offset).
		Limit(count)

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, 0, err
	}

	results := []*modelInputs.AlertStateChange{}
	for rows.Next() {
		result, err := scanAlertStateChange(rows)
		if err != nil {
			return nil, 0, err
		}

		results = append(results, result)
	}

	return results, int64(totalCount), nil
}

func (client *Client) GetLastAlertStateChanges(ctx context.Context, projectId int, alertId int) ([]*modelInputs.AlertStateChange, error) {
	scanAlertStateChange := func(rows driver.Rows) (*modelInputs.AlertStateChange, error) {
		var result AlertStateChangeRow
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		return &modelInputs.AlertStateChange{
			ProjectID:  int(result.ProjectID),
			AlertID:    int(result.AlertID),
			Timestamp:  result.Timestamp,
			State:      modelInputs.AlertState(result.State),
			GroupByKey: result.GroupByKey,
		}, nil
	}

	innerSb := sqlbuilder.NewSelectBuilder()
	innerSb.Select("Max(Timestamp)").
		From(AlertStateChangesTable).
		Where(innerSb.Equal("ProjectID", projectId)).
		Where(innerSb.Equal("AlertID", alertId))

	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("ProjectID", "AlertID", "Timestamp", "State", "GroupByKey").
		From(AlertStateChangesTable).
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.Equal("AlertID", alertId)).
		Where(sb.In("Timestamp", innerSb))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	results := []*modelInputs.AlertStateChange{}
	for rows.Next() {
		result, err := scanAlertStateChange(rows)
		if err != nil {
			return nil, err
		}

		results = append(results, result)
	}

	return results, nil
}

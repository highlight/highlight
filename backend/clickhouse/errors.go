package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
)

type ClickhouseErrorGroup struct {
	ProjectID int32
	CreatedAt time.Time
	ID        int64
	Event     string
	Status    string
	Type      string
}

type ClickhouseErrorObject struct {
	ProjectID      int32
	Timestamp      time.Time
	ErrorGroupID   int64
	ID             int64
	Browser        string
	Environment    string
	OSName         string
	ServiceName    string
	ServiceVersion string
	ClientID       string
}

const ErrorGroupsTable = "error_groups"
const ErrorObjectsTable = "error_objects"

func (client *Client) WriteErrorGroups(ctx context.Context, groups []*model.ErrorGroup) error {
	chGroups := []interface{}{}

	for _, group := range groups {
		if group == nil {
			return errors.New("nil group")
		}

		chEg := ClickhouseErrorGroup{
			ProjectID: int32(group.ProjectID),
			CreatedAt: group.CreatedAt,
			ID:        int64(group.ID),
			Event:     group.Event,
			Status:    string(group.State),
			Type:      group.Type,
		}

		chGroups = append(chGroups, &chEg)
	}

	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))

	if len(chGroups) > 0 {
		sql, args := sqlbuilder.
			NewStruct(new(ClickhouseErrorGroup)).
			InsertInto(ErrorGroupsTable, chGroups...).
			BuildWithFlavor(sqlbuilder.ClickHouse)
		return client.conn.Exec(chCtx, sql, args...)
	}

	return nil
}

func (client *Client) WriteErrorObjects(ctx context.Context, objects []*model.ErrorObject, sessions []*model.Session) error {
	chObjects := []interface{}{}

	sessionsById := lo.KeyBy(sessions, func(session *model.Session) int {
		return session.ID
	})

	for _, object := range objects {
		if object == nil {
			return errors.New("nil object")
		}

		clientId := ""
		if object.SessionID != nil {
			relatedSession := sessionsById[*object.SessionID]
			if relatedSession != nil {
				clientId = relatedSession.ClientID
			}
		}

		chEg := ClickhouseErrorObject{
			ProjectID:      int32(object.ProjectID),
			Timestamp:      object.Timestamp,
			ErrorGroupID:   int64(object.ErrorGroupID),
			ID:             int64(object.ID),
			Browser:        object.Browser,
			Environment:    object.Environment,
			OSName:         object.OS,
			ServiceName:    object.ServiceName,
			ServiceVersion: object.ServiceVersion,
			ClientID:       clientId,
		}

		chObjects = append(chObjects, &chEg)
	}

	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))

	if len(chObjects) > 0 {
		sql, args := sqlbuilder.
			NewStruct(new(ClickhouseErrorObject)).
			InsertInto(ErrorObjectsTable, chObjects...).
			BuildWithFlavor(sqlbuilder.ClickHouse)
		return client.conn.Exec(chCtx, sql, args...)
	}

	return nil
}

func getErrorGroupsQueryImpl(query modelInputs.ClickhouseQuery, projectId int, retentionDate time.Time, selectColumns string, groupBy *string, orderBy *string, limit *int, offset *int) (string, []interface{}, error) {
	rules, err := deserializeRules(query.Rules)
	if err != nil {
		return "", nil, err
	}

	timeRangeRule, found := lo.Find(rules, func(r Rule) bool {
		return r.Field == timeRangeField
	})
	if !found {
		end := time.Now()
		start := end.AddDate(0, 0, -30)
		timeRangeRule = Rule{
			Field: timeRangeField,
			Op:    BetweenDate,
			Val:   []string{fmt.Sprintf("%s_%s", start.Format(timeFormat), end.Format(timeFormat))},
		}
		rules = append(rules, timeRangeRule)
	}
	if len(timeRangeRule.Val) != 1 {
		return "", nil, fmt.Errorf("unexpected length of time range value: %s", timeRangeRule.Val)
	}
	start, end, found := strings.Cut(timeRangeRule.Val[0], "_")
	if !found {
		return "", nil, fmt.Errorf("separator not found for time range: %s", timeRangeRule.Val[0])
	}
	startTime, err := time.Parse(timeFormat, start)
	if err != nil {
		return "", nil, err
	}
	endTime, err := time.Parse(timeFormat, end)
	if err != nil {
		return "", nil, err
	}

	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(selectColumns).
		From("errors FINAL").
		Where(sb.And(
			sb.Equal("ProjectID", projectId),
			sb.GreaterThan("UpdatedAt", retentionDate)))

	conditions, err := parseGroup(nil, query.IsAnd, rules, projectId, startTime, endTime, sb)
	if err != nil {
		return "", nil, err
	}

	sb = sb.Where(conditions)
	if groupBy != nil {
		sb = sb.GroupBy(*groupBy)
	}
	if orderBy != nil {
		sb = sb.OrderBy(*orderBy)
	}
	if limit != nil {
		sb = sb.Limit(*limit)
	}
	if offset != nil {
		sb = sb.Offset(*offset)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	return sql, args, nil
}

func (client *Client) QueryErrorGroupIds(ctx context.Context, projectId int, count int, query modelInputs.ClickhouseQuery, sortField string, page *int, retentionDate time.Time) ([]int64, int64, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, err := getErrorGroupsQueryImpl(query, projectId, retentionDate, "ID, count() OVER() AS total", nil, pointy.String(sortField), pointy.Int(count), pointy.Int(offset))
	if err != nil {
		return nil, 0, err
	}

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, 0, err
	}

	ids := []int64{}
	var total uint64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id, &total); err != nil {
			return nil, 0, err
		}
		ids = append(ids, id)
	}

	return ids, int64(total), nil
}

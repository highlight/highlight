package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/huandu/go-sqlbuilder"
)

type ClickhouseField struct {
	ProjectID        int32
	Type             string
	Name             string
	SessionCreatedAt time.Time
	SessionID        int64
	Value            string
	Timestamp        time.Time
}

const FieldsTable = "fields"
const FieldsBySessionTable = "fields_by_session"

func (client *Client) GetSessionFields(ctx context.Context, projectId int, sessionId int) ([]*model.Field, error) {
	span, ctx := util.StartSpanFromContext(ctx, "clickhouse.GetSessionFields")
	defer span.Finish()

	sb := sqlbuilder.NewSelectBuilder()

	sb.Select("*").
		From(fmt.Sprintf("%s FINAL", FieldsBySessionTable)).
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.Equal("SessionID", sessionId))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	fields := []*model.Field{}
	for rows.Next() {
		var field ClickhouseField
		if err := rows.ScanStruct(&field); err != nil {
			return nil, err
		}
		fields = append(fields, &model.Field{
			Type:  field.Type,
			Name:  field.Name,
			Value: field.Value,
		})
	}

	return fields, nil
}

func (client *Client) QueryFieldValues(ctx context.Context, projectId int, count int, fieldType string, fieldName string, query string, start time.Time, end time.Time) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("Value").
		From(FieldsTable).
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.Equal("Type", fieldType)).
		Where(sb.Equal("Name", fieldName)).
		Where(fmt.Sprintf("Value ILIKE %s", sb.Var("%"+query+"%"))).
		Where(sb.Between("SessionCreatedAt", start, end))

	sb.GroupBy("1").
		OrderBy("count() DESC").
		Limit(count)

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	values := []string{}
	for rows.Next() {
		var value string
		if err := rows.Scan(&value); err != nil {
			return nil, err
		}
		values = append(values, value)
	}

	return values, nil
}

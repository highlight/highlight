package clickhouse

import (
	"context"
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
		From(FieldsBySessionTable).
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

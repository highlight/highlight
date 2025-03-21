package clickhouse

import (
	"context"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
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

func (client *Client) WriteFields(ctx context.Context, session *model.Session, fields []*model.Field) error {
	if len(fields) == 0 {
		return nil
	}

	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))

	ib := sqlbuilder.
		NewStruct(new(ClickhouseField)).
		InsertInto(FieldsTable).
		Cols("ProjectID", "Type", "Name", "SessionCreatedAt", "SessionID", "Value", "Timestamp")

	for _, field := range fields {
		ib.Values(int32(field.ProjectID), field.Type, field.Name, session.CreatedAt, int64(session.ID), field.Value, field.Timestamp)
	}

	sql, args := ib.BuildWithFlavor(sqlbuilder.ClickHouse)

	return client.conn.Exec(chCtx, sql, args...)
}

func (client *Client) GetFieldsBySession(ctx context.Context, projectId int, sessionId int) ([]*model.Field, error) {
	sb := sqlbuilder.
		NewSelectBuilder()

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

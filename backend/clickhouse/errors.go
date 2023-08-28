package clickhouse

import (
	"context"
	"errors"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/huandu/go-sqlbuilder"
)

type ClickhouseErrorGroup struct {
	ProjectID    int32
	CreatedAt    time.Time
	ErrorGroupID int64
	Event        string
	Status       string
	Type         string
}

type ClickhouseErrorObject struct {
	ProjectID    int32
	CreatedAt    time.Time
	ErrorGroupID int64
	Browser      string
	Environment  string
	OSName       string
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
			ProjectID:    int32(group.ProjectID),
			CreatedAt:    group.CreatedAt,
			ErrorGroupID: int64(group.ID),
			Event:        group.Event,
			Status:       string(group.State),
			Type:         group.Type,
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

func (client *Client) WriteErrorObjects(ctx context.Context, objects []*model.ErrorObject) error {
	chObjects := []interface{}{}

	for _, object := range objects {
		if object == nil {
			return errors.New("nil object")
		}

		chEg := ClickhouseErrorObject{
			ProjectID:    int32(object.ProjectID),
			CreatedAt:    object.CreatedAt,
			ErrorGroupID: int64(object.ID),
			Browser:      object.Browser,
			Environment:  object.Environment,
			OSName:       object.OS,
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

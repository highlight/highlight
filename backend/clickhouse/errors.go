package clickhouse

import (
	"context"
	"errors"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/huandu/go-sqlbuilder"
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
	CreatedAt      time.Time
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
			CreatedAt:      object.CreatedAt,
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

package clickhouse

import (
	"context"
	"errors"
	"fmt"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
)

type ClickhouseSession struct {
	model.Session
	ID             int64
	Fingerprint    int32
	ProjectID      int32
	PagesVisited   int32
	ViewedByAdmins []int32
	FieldKeys      []string
	FieldKeyValues []string
}

const SessionsTable = "sessions"

func (client *Client) WriteSessions(ctx context.Context, sessions []*model.Session) error {
	// Not sure if these settings work with batching and the native protocol
	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))

	batch, err := client.conn.PrepareBatch(chCtx, fmt.Sprintf("INSERT INTO %s", SessionsTable))
	if err != nil {
		return e.Wrap(err, "failed to create sessions batch")
	}

	for _, session := range sessions {
		if session.Fields == nil {
			return errors.New("session.Fields is required")
		}

		if session.ViewedByAdmins == nil {
			return errors.New("session.ViewedByAdmins is required")
		}

		fieldKeys := []string{}
		fieldKeyValues := []string{}
		for _, field := range session.Fields {
			fieldKeys = append(fieldKeys, field.Type+"_"+field.Name)
			fieldKeyValues = append(fieldKeyValues, field.Type+"_"+field.Name+"_"+field.Value)
		}

		viewedByAdmins := []int32{}
		for _, admin := range session.ViewedByAdmins {
			viewedByAdmins = append(viewedByAdmins, int32(admin.ID))
		}

		ch := ClickhouseSession{
			Session:        *session,
			ID:             int64(session.ID),
			Fingerprint:    int32(session.Fingerprint),
			ProjectID:      int32(session.ProjectID),
			PagesVisited:   int32(session.PagesVisited),
			ViewedByAdmins: viewedByAdmins,
			FieldKeys:      fieldKeys,
			FieldKeyValues: fieldKeyValues,
		}

		if err := batch.AppendStruct(&ch); err != nil {
			return err
		}
	}

	return batch.Send()
}

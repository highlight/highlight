package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/huandu/go-sqlbuilder"
	"golang.org/x/sync/errgroup"
)

type ClickhouseSession struct {
	ID                 int64
	Fingerprint        int32
	ProjectID          int32
	PagesVisited       int32
	ViewedByAdmins     clickhouse.ArraySet
	FieldKeys          clickhouse.ArraySet
	FieldKeyValues     clickhouse.ArraySet
	CreatedAt          time.Time
	UpdatedAt          time.Time
	SecureID           string
	Identified         bool
	Identifier         string
	City               string
	Country            string
	OSName             string
	OSVersion          string
	BrowserName        string
	BrowserVersion     string
	Processed          *bool
	HasRageClicks      *bool
	HasErrors          *bool
	Length             int64
	ActiveLength       int64
	Environment        string
	AppVersion         *string
	FirstTime          *bool
	Viewed             *bool
	WithinBillingQuota *bool
	EventCounts        *string
	Excluded           bool
	Normalness         *float64
}

type ClickhouseField struct {
	ProjectID int32
	Type      string
	Name      string
	Value     string
	SessionID int64
}

const SessionsTable = "sessions"
const FieldsTable = "fields"

func (client *Client) WriteSessions(ctx context.Context, sessions []*model.Session) error {
	chFields := []interface{}{}
	chSessions := []interface{}{}

	for _, session := range sessions {
		if session == nil {
			return errors.New("nil session")
		}

		if session.Fields == nil {
			return fmt.Errorf("session.Fields is required for session %d", session.ID)
		}

		if session.ViewedByAdmins == nil {
			return fmt.Errorf("session.ViewedByAdmins is required for session %d", session.ID)
		}

		var fieldKeys clickhouse.ArraySet
		var fieldKeyValues clickhouse.ArraySet
		for _, field := range session.Fields {
			if field == nil {
				continue
			}
			fieldKeys = append(fieldKeys, field.Type+"_"+field.Name)
			fieldKeyValues = append(fieldKeyValues, field.Type+"_"+field.Name+"_"+field.Value)
			chf := ClickhouseField{
				ProjectID: int32(session.ProjectID),
				Type:      field.Type,
				Name:      field.Name,
				Value:     field.Value,
				SessionID: int64(session.ID),
			}
			chFields = append(chFields, &chf)
		}

		var viewedByAdmins clickhouse.ArraySet
		for _, admin := range session.ViewedByAdmins {
			viewedByAdmins = append(viewedByAdmins, int32(admin.ID))
		}

		chs := ClickhouseSession{
			ID:                 int64(session.ID),
			Fingerprint:        int32(session.Fingerprint),
			ProjectID:          int32(session.ProjectID),
			PagesVisited:       int32(session.PagesVisited),
			ViewedByAdmins:     viewedByAdmins,
			FieldKeys:          fieldKeys,
			FieldKeyValues:     fieldKeyValues,
			CreatedAt:          session.CreatedAt,
			UpdatedAt:          session.UpdatedAt,
			SecureID:           session.SecureID,
			Identified:         session.Identified,
			Identifier:         session.Identifier,
			City:               session.City,
			Country:            session.Country,
			OSName:             session.OSName,
			OSVersion:          session.OSVersion,
			BrowserName:        session.BrowserName,
			BrowserVersion:     session.BrowserVersion,
			Processed:          session.Processed,
			HasRageClicks:      session.HasRageClicks,
			HasErrors:          session.HasErrors,
			Length:             session.Length,
			ActiveLength:       session.ActiveLength,
			Environment:        session.Environment,
			AppVersion:         session.AppVersion,
			FirstTime:          session.FirstTime,
			Viewed:             session.Viewed,
			WithinBillingQuota: session.WithinBillingQuota,
			EventCounts:        session.EventCounts,
			Excluded:           session.Excluded,
			Normalness:         session.Normalness,
		}

		chSessions = append(chSessions, &chs)
	}

	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))

	var g errgroup.Group

	if len(chSessions) > 0 {
		sessionsSql, sessionsArgs := sqlbuilder.
			NewStruct(new(ClickhouseSession)).
			InsertInto(SessionsTable, chSessions...).
			BuildWithFlavor(sqlbuilder.ClickHouse)
		g.Go(func() error {
			return client.conn.Exec(chCtx, sessionsSql, sessionsArgs...)
		})
	}

	if len(chFields) > 0 {
		fieldsSql, fieldsArgs := sqlbuilder.
			NewStruct(new(ClickhouseField)).
			InsertInto(FieldsTable, chFields...).
			BuildWithFlavor(sqlbuilder.ClickHouse)

		g.Go(func() error {
			return client.conn.Exec(chCtx, fieldsSql, fieldsArgs...)
		})
	}

	return g.Wait()
}

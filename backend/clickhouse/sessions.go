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
	"golang.org/x/sync/errgroup"
)

const timeFormat = "2006-01-02T15:04:05.000Z"

var fieldMap map[string]string = map[string]string{
	"fingerprint":     "Fingerprint",
	"pages_visited":   "PagesVisited",
	"viewed_by_me":    "ViewedByAdmins",
	"created_at":      "CreatedAt",
	"updated_at":      "UpdatedAt",
	"identified":      "Identified",
	"identifier":      "Identifier",
	"city":            "City",
	"country":         "Country",
	"os_name":         "OSName",
	"os_version":      "OSVersion",
	"browser_name":    "BrowserName",
	"browser_version": "BrowserVersion",
	"processed":       "Processed",
	"has_rage_clicks": "HasRageClicks",
	"has_errors":      "HasErrors",
	"has_session":     "HasSession",
	"length":          "Length",
	"active_length":   "ActiveLength",
	"environment":     "Environment",
	"app_version":     "AppVersion",
	"first_time":      "FirstTime",
	"viewed":          "Viewed",
	"Type":            "Type",
	"Event":           "Event",
	"event":           "Event",
	"state":           "Status",
	"browser":         "Browser",
	"visited_url":     "VisitedURL",
	"timestamp":       "Timestamp",
	"secure_id":       "ErrorGroupSecureID",
	"service_name":    "ServiceName",
}

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
	IP                 string
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
	ProjectID        int32
	Type             string
	Name             string
	SessionCreatedAt time.Time
	SessionID        int64
	Value            string
}

const SessionsTable = "sessions"
const FieldsTable = "fields"
const timeRangeField = "custom_created_at"

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
				ProjectID:        int32(session.ProjectID),
				Type:             field.Type,
				Name:             field.Name,
				Value:            field.Value,
				SessionID:        int64(session.ID),
				SessionCreatedAt: session.CreatedAt,
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
			IP:                 session.IP,
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

func getSessionsQueryImpl(admin *model.Admin, query modelInputs.ClickhouseQuery, projectId int, retentionDate time.Time, selectColumns string, groupBy *string, orderBy *string, limit *int, offset *int) (string, []interface{}, error) {
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
		From("sessions FINAL").
		Where(sb.And(sb.Equal("ProjectID", projectId),
			"NOT Excluded",
			"WithinBillingQuota",
			sb.Or("NOT Processed",
				sb.GreaterEqualThan("ActiveLength", 1000),
				sb.And(sb.IsNull("ActiveLength"), sb.GreaterEqualThan("Length", 1000)))),
			sb.GreaterThan("CreatedAt", retentionDate),
		)

	conditions, err := parseSessionRules(admin, query.IsAnd, rules, projectId, startTime, endTime, sb)
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

func (client *Client) QuerySessionIds(ctx context.Context, admin *model.Admin, projectId int, count int, query modelInputs.ClickhouseQuery, sortField string, page *int, retentionDate time.Time) ([]int64, int64, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, err := getSessionsQueryImpl(admin, query, projectId, retentionDate, "ID, count() OVER() AS total", nil, pointy.String(sortField), pointy.Int(count), pointy.Int(offset))
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

func (client *Client) QuerySessionHistogram(ctx context.Context, admin *model.Admin, projectId int, query modelInputs.ClickhouseQuery, retentionDate time.Time, options modelInputs.DateHistogramOptions) ([]time.Time, []int64, []int64, []int64, error) {
	aggFn, addFn, location, err := getClickhouseHistogramSettings(options)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	selectCols := fmt.Sprintf("%s(CreatedAt, '%s') as time, count() as count, sum(if(HasErrors, 1, 0)) as has_errors", aggFn, location.String())

	orderBy := fmt.Sprintf("1 WITH FILL FROM %s(?, '%s') TO %s(?, '%s') STEP 1", aggFn, location.String(), aggFn, location.String())

	sql, args, err := getSessionsQueryImpl(admin, query, projectId, retentionDate, selectCols, pointy.String("1"), &orderBy, nil, nil)
	if err != nil {
		return nil, nil, nil, nil, err
	}
	args = append(args, *options.Bounds.StartDate, *options.Bounds.EndDate)
	sql = fmt.Sprintf("SELECT %s(makeDate(0, 0), time), count, has_errors from (%s)", addFn, sql)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	bucketTimes := []time.Time{}
	totals := []int64{}
	withErrors := []int64{}
	withoutErrors := []int64{}
	for rows.Next() {
		var time time.Time
		var total uint64
		var withError uint64
		if err := rows.Scan(&time, &total, &withError); err != nil {
			return nil, nil, nil, nil, err
		}
		bucketTimes = append(bucketTimes, time)
		totals = append(totals, int64(total))
		withErrors = append(withErrors, int64(withError))
		withoutErrors = append(withoutErrors, int64(total-withError))
	}

	return bucketTimes, totals, withErrors, withoutErrors, nil
}

func (client *Client) QueryFieldNames(ctx context.Context, projectId int, start time.Time, end time.Time) ([]*model.Field, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.
		Select("DISTINCT Type, Name").
		From("fields").
		Where(sb.And(
			sb.Equal("ProjectID", projectId),
			sb.Between("SessionCreatedAt", start, end))).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	fields := []*model.Field{}
	for rows.Next() {
		var typ string
		var name string
		if err := rows.Scan(&typ, &name); err != nil {
			return nil, err
		}
		fields = append(fields, &model.Field{Type: typ, Name: name})
	}

	return fields, nil
}

func (client *Client) QueryFieldValues(ctx context.Context, projectId int, count int, fieldType string, fieldName string, query string, start time.Time, end time.Time) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.
		Select("Value").
		From("fields").
		Where(sb.And(
			sb.Equal("ProjectID", projectId),
			sb.Equal("Type", fieldType),
			sb.Equal("Name", fieldName),
			fmt.Sprintf("Value ILIKE %s", sb.Var("%"+query+"%")),
			sb.Between("SessionCreatedAt", start, end))).
		GroupBy("1").
		OrderBy("count() DESC").
		Limit(count).
		BuildWithFlavor(sqlbuilder.ClickHouse)

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

func (client *Client) DeleteSessions(ctx context.Context, projectId int, sessionIds []int) error {
	sb := sqlbuilder.NewDeleteBuilder()
	sb.DeleteFrom(SessionsTable).
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.In("ID", sessionIds))
	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	return client.conn.Exec(ctx, sql, args...)
}

package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/parser/listener"

	"github.com/samber/lo"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	"github.com/openlyinc/pointy"
	"golang.org/x/sync/errgroup"
)

const timeFormat = "2006-01-02T15:04:05.000Z"

var fieldMap map[string]string = map[string]string{
	"fingerprint":       "Fingerprint",
	"pages_visited":     "PagesVisited",
	"viewed_by_me":      "ViewedByAdmins",
	"created_at":        "CreatedAt",
	"updated_at":        "UpdatedAt",
	"identified":        "Identified",
	"identifier":        "Identifier",
	"city":              "City",
	"country":           "Country",
	"os_name":           "OSName",
	"os_version":        "OSVersion",
	"browser_name":      "BrowserName",
	"browser_version":   "BrowserVersion",
	"processed":         "Processed",
	"has_rage_clicks":   "HasRageClicks",
	"has_errors":        "HasErrors",
	"has_session":       "HasSession",
	"length":            "Length",
	"active_length":     "ActiveLength",
	"environment":       "Environment",
	"app_version":       "AppVersion",
	"first_time":        "FirstTime",
	"viewed":            "Viewed",
	"Type":              "Type",
	"Event":             "Event",
	"event":             "Event",
	"state":             "Status",
	"browser":           "Browser",
	"visited_url":       "VisitedURL",
	"timestamp":         "Timestamp",
	"secure_id":         "ErrorGroupSecureID",
	"service_name":      "ServiceName",
	"service_version":   "ServiceVersion",
	"Tag":               "ErrorTagTitle",
	"secure_session_id": "SecureSessionID",
	"trace_id":          "TraceID",
}

type ClickhouseSession struct {
	ID                 int64
	Fingerprint        int32
	ProjectID          int32
	PagesVisited       int32
	ViewedByAdmins     clickhouse.ArraySet
	FieldKeys          clickhouse.ArraySet
	FieldKeyValues     clickhouse.ArraySet
	CreatedAt          int64
	UpdatedAt          int64
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
	SessionCreatedAt int64
	SessionID        int64
	Value            string
}

const SessionsTable = "sessions"
const FieldsTable = "fields"
const SessionKeysTable = "session_keys"
const timeRangeField = "custom_created_at"
const sampleField = "custom_sample"

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
				SessionCreatedAt: session.CreatedAt.UnixMicro(),
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
			CreatedAt:          session.CreatedAt.UnixMicro(),
			UpdatedAt:          session.UpdatedAt.UnixMicro(),
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
		g.Go(func() error {
			sessionsSql, sessionsArgs := sqlbuilder.
				NewStruct(new(ClickhouseSession)).
				InsertInto(SessionsTable, chSessions...).
				BuildWithFlavor(sqlbuilder.ClickHouse)
			sessionsSql, sessionsArgs = replaceTimestampInserts(sessionsSql, sessionsArgs, 32, map[int]bool{7: true, 8: true}, MicroSeconds)
			return client.conn.Exec(chCtx, sessionsSql, sessionsArgs...)
		})
	}

	if len(chFields) > 0 {
		g.Go(func() error {
			fieldsSql, fieldsArgs := sqlbuilder.
				NewStruct(new(ClickhouseField)).
				InsertInto(FieldsTable, chFields...).
				BuildWithFlavor(sqlbuilder.ClickHouse)
			fieldsSql, fieldsArgs = replaceTimestampInserts(fieldsSql, fieldsArgs, 6, map[int]bool{3: true}, MicroSeconds)
			return client.conn.Exec(chCtx, fieldsSql, fieldsArgs...)
		})
	}

	return g.Wait()
}

func GetSessionsQueryImpl(admin *model.Admin, query modelInputs.ClickhouseQuery, projectId int, retentionDate time.Time, selectColumns string, groupBy *string, orderBy *string, limit *int, offset *int) (string, []interface{}, bool, error) {
	rules, err := deserializeRules(query.Rules)
	if err != nil {
		return "", nil, false, err
	}

	sampleRule, sampleRuleIdx, sampleRuleFound := lo.FindIndexOf(rules, func(r Rule) bool {
		return r.Field == sampleField
	})
	if sampleRuleFound {
		rules = append(rules[:sampleRuleIdx], rules[sampleRuleIdx+1:]...)
	}
	useRandomSample := sampleRuleFound && groupBy == nil

	end := query.DateRange.EndDate.UTC()
	start := query.DateRange.StartDate.UTC()
	timeRangeRule := Rule{
		Field: timeRangeField,
		Op:    BetweenDate,
		Val:   []string{fmt.Sprintf("%s_%s", start.Format(timeFormat), end.Format(timeFormat))},
	}
	rules = append(rules, timeRangeRule)

	if useRandomSample {
		salt, err := strconv.ParseUint(sampleRule.Val[0], 16, 64)
		if err != nil {
			return "", nil, false, err
		}
		selectColumns = fmt.Sprintf("%s, toUInt64(farmHash64(SecureID) %% %d) as hash", selectColumns, salt)
		orderBy = pointy.String("hash")
	}
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(selectColumns).
		From("sessions FINAL").
		Where(sb.And(sb.Equal("ProjectID", projectId),
			"NOT Excluded",
			"WithinBillingQuota"),
			sb.GreaterThan("CreatedAt", retentionDate),
		)

	conditions, err := parseSessionRules(admin, query.IsAnd, rules, projectId, start, end, sb)
	if err != nil {
		return "", nil, false, err
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

	if useRandomSample {
		sbOuter := sqlbuilder.NewSelectBuilder()
		sb = sbOuter.
			Select("*").
			From(sbOuter.BuilderAs(sb, "inner"))
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	return sql, args, useRandomSample, nil
}

func (client *Client) QuerySessionIds(ctx context.Context, admin *model.Admin, projectId int, count int, query modelInputs.ClickhouseQuery, sortField string, page *int, retentionDate time.Time) ([]int64, int64, bool, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, sampleRuleFound, err := GetSessionsQueryImpl(admin, query, projectId, retentionDate, "ID, count() OVER() AS total", nil, pointy.String(sortField), pointy.Int(count), pointy.Int(offset))
	if err != nil {
		return nil, 0, false, err
	}

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, 0, false, err
	}

	var ids []int64
	var total uint64
	for rows.Next() {
		var id int64
		columns := []interface{}{&id, &total}
		if sampleRuleFound {
			var hash uint64
			columns = append(columns, &hash)
		}
		if err := rows.Scan(columns...); err != nil {
			return nil, 0, false, err
		}
		ids = append(ids, id)
	}

	return ids, int64(total), sampleRuleFound, nil
}

func (client *Client) QuerySessionHistogram(ctx context.Context, admin *model.Admin, projectId int, query modelInputs.ClickhouseQuery, retentionDate time.Time, options modelInputs.DateHistogramOptions) ([]time.Time, []int64, []int64, []int64, error) {
	aggFn, addFn, location, err := getClickhouseHistogramSettings(options)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	selectCols := fmt.Sprintf("%s(CreatedAt, '%s') as time, count() as count, sum(if(HasErrors, 1, 0)) as has_errors", aggFn, location.String())

	orderBy := fmt.Sprintf("1 WITH FILL FROM %s(?, '%s') TO %s(?, '%s') STEP 1", aggFn, location.String(), aggFn, location.String())

	sql, args, _, err := GetSessionsQueryImpl(admin, query, projectId, retentionDate, selectCols, pointy.String("1"), &orderBy, nil, nil)
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

var SessionsTableConfig = model.TableConfig[string]{
	TableName:        SessionsTable,
	KeysToColumns:    fieldMap,
	AttributesColumn: "Fields",
	ReservedKeys: lo.Map(modelInputs.AllReservedSessionKey, func(item modelInputs.ReservedSessionKey, _ int) string {
		return item.String()
	}),
}

func SessionMatchesQuery(session *model.Session, filters listener.Filters) bool {
	return matchesQuery(session, SessionsTableConfig, filters)
}

var sessionsJoinedTableConfig = model.TableConfig[modelInputs.ReservedSessionKey]{
	TableName:        "sessions_joined_vw",
	AttributesColumn: "SessionAttributes",
	KeysToColumns: map[modelInputs.ReservedSessionKey]string{
		modelInputs.ReservedSessionKeyEnvironment:     "Environment",
		modelInputs.ReservedSessionKeyAppVersion:      "AppVersion",
		modelInputs.ReservedSessionKeySecureSessionID: "SecureID",
		modelInputs.ReservedSessionKeyFingerprint:     "Fingerprint",
		modelInputs.ReservedSessionKeyIdentifier:      "Identifier",
		modelInputs.ReservedSessionKeyCity:            "City",
		modelInputs.ReservedSessionKeyCountry:         "Country",
		modelInputs.ReservedSessionKeyOsName:          "OSName",
		modelInputs.ReservedSessionKeyOsVersion:       "OSVersion",
		modelInputs.ReservedSessionKeyBrowserName:     "BrowserName",
		modelInputs.ReservedSessionKeyBrowserVersion:  "BrowserVersion",
		modelInputs.ReservedSessionKeyProcessed:       "Processed",
		modelInputs.ReservedSessionKeyHasRageClicks:   "HasRageClicks",
		modelInputs.ReservedSessionKeyHasErrors:       "HasErrors",
		modelInputs.ReservedSessionKeyLength:          "Length",
		modelInputs.ReservedSessionKeyActiveLength:    "ActiveLength",
		modelInputs.ReservedSessionKeyFirstTime:       "FirstTime",
		modelInputs.ReservedSessionKeyViewed:          "Viewed",
		modelInputs.ReservedSessionKeyPagesVisited:    "PagesVisited",
		modelInputs.ReservedSessionKeyNormalness:      "Normalness",
	},
	ReservedKeys: modelInputs.AllReservedSessionKey,
}

var sessionsSampleableTableConfig = sampleableTableConfig[modelInputs.ReservedSessionKey]{
	tableConfig: sessionsJoinedTableConfig,
	useSampling: func(time.Duration) bool {
		return false
	},
}

func (client *Client) ReadSessionsMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return readMetrics(ctx, client, sessionsSampleableTableConfig, projectID, params, column, metricTypes, groupBy, nBuckets, bucketBy, limit, limitAggregator, limitColumn)
}

func (client *Client) SessionsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	return KeysAggregated(ctx, client, SessionKeysTable, projectID, startDate, endDate, query, typeArg)
}

func (client *Client) QuerySessionCustomMetrics(ctx context.Context, projectId int, sessionSecureId string, metricNames []string) ([]*model.Metric, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.
		Select("Name, Value").
		From("session_metrics").
		Where(sb.And(
			sb.Equal("ProjectId", projectId),
			sb.Equal("SecureSessionId", sessionSecureId),
			sb.In("Name", metricNames))).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	metrics := []*model.Metric{}
	for rows.Next() {
		var name string
		var value float64
		if err := rows.Scan(&name, &value); err != nil {
			return nil, err
		}
		metrics = append(metrics, &model.Metric{Name: name, Value: value})
	}

	return metrics, nil
}

func (client *Client) SessionsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.
		Select("Value").
		From("fields").
		Where(sb.And(
			sb.Equal("ProjectID", projectID),
			sb.Equal("Name", keyName),
			sb.Between("SessionCreatedAt", startDate, endDate))).
		GroupBy("1").
		OrderBy("count() DESC").
		Limit(10).
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

func (client *Client) GetConn() driver.Conn {
	return client.conn
}

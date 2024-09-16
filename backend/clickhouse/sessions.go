package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/parser"
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

var fieldMap = map[string]string{
	"pages_visited":     "PagesVisited",
	"viewed_by_me":      "ViewedByAdmins",
	"created_at":        "CreatedAt",
	"updated_at":        "UpdatedAt",
	"identified":        "Identified",
	"identifier":        "Identifier",
	"city":              "City",
	"loc_state":         "State",
	"country":           "Country",
	"os_name":           "OSName",
	"os_version":        "OSVersion",
	"browser_name":      "BrowserName",
	"browser_version":   "BrowserVersion",
	"processed":         "Processed",
	"excluded":          "Excluded",
	"has_comments":      "HasComments",
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
	"secure_id":         "SecureID",
	"service_name":      "ServiceName",
	"service_version":   "ServiceVersion",
	"Tag":               "ErrorTagTitle",
	"secure_session_id": "SecureSessionID",
	"trace_id":          "TraceID",
}

type ClickhouseSession struct {
	ID                 int64
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
	State              string
	Country            string
	OSName             string
	OSVersion          string
	BrowserName        string
	BrowserVersion     string
	Processed          *bool
	HasComments        bool
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

// These keys show up as recommendations, not in fields table due to high cardinality or post processing booleans
var defaultSessionsKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedSessionKeyActiveLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedSessionKeyCompleted), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedSessionKeyFirstTime), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedSessionKeyHasComments), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedSessionKeyHasErrors), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedSessionKeyHasRageClicks), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedSessionKeyIdentified), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedSessionKeyLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedSessionKeyPagesVisited), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedSessionKeySample), Type: modelInputs.KeyTypeCreatable},
	{Name: string(modelInputs.ReservedSessionKeySecureID), Type: modelInputs.KeyTypeString},
	{Name: string(modelInputs.ReservedSessionKeyViewedByAnyone), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedSessionKeyViewedByMe), Type: modelInputs.KeyTypeBoolean},
}

var booleanKeys = map[string]bool{
	string(modelInputs.ReservedSessionKeyCompleted):      true,
	string(modelInputs.ReservedSessionKeyFirstTime):      true,
	string(modelInputs.ReservedSessionKeyIdentified):     true,
	string(modelInputs.ReservedSessionKeyHasComments):    true,
	string(modelInputs.ReservedSessionKeyHasErrors):      true,
	string(modelInputs.ReservedSessionKeyHasRageClicks):  true,
	string(modelInputs.ReservedSessionKeyViewedByAnyone): true,
	string(modelInputs.ReservedSessionKeyViewedByMe):     true,
}

const SessionsJoinedTable = "sessions_joined_vw"
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
			State:              session.State,
			Country:            session.Country,
			OSName:             session.OSName,
			OSVersion:          session.OSVersion,
			BrowserName:        session.BrowserName,
			BrowserVersion:     session.BrowserVersion,
			Processed:          session.Processed,
			HasComments:        session.HasComments,
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
			sessionsSql, sessionsArgs = replaceTimestampInserts(sessionsSql, sessionsArgs, map[int]bool{6: true, 7: true}, MicroSeconds)
			return client.conn.Exec(chCtx, sessionsSql, sessionsArgs...)
		})
	}

	if len(chFields) > 0 {
		g.Go(func() error {
			fieldsSql, fieldsArgs := sqlbuilder.
				NewStruct(new(ClickhouseField)).
				InsertInto(FieldsTable, chFields...).
				BuildWithFlavor(sqlbuilder.ClickHouse)
			fieldsSql, fieldsArgs = replaceTimestampInserts(fieldsSql, fieldsArgs, map[int]bool{3: true}, MicroSeconds)
			return client.conn.Exec(chCtx, fieldsSql, fieldsArgs...)
		})
	}

	return g.Wait()
}

func GetSessionsQueryImplDeprecated(admin *model.Admin, query modelInputs.ClickhouseQuery, projectId int, retentionDate time.Time, selectColumns string, groupBy *string, orderBy *string, limit *int, offset *int) (string, []interface{}, bool, error) {
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

func (client *Client) QuerySessionIdsDeprecated(ctx context.Context, admin *model.Admin, projectId int, count int, query modelInputs.ClickhouseQuery, sortField string, page *int, retentionDate time.Time) ([]int64, int64, bool, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, sampleRuleFound, err := GetSessionsQueryImplDeprecated(admin, query, projectId, retentionDate, "ID, count() OVER() AS total", nil, pointy.String(sortField), pointy.Int(count), pointy.Int(offset))
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

func (client *Client) QuerySessionHistogramDeprecated(ctx context.Context, admin *model.Admin, projectId int, query modelInputs.ClickhouseQuery, retentionDate time.Time, options modelInputs.DateHistogramOptions) ([]time.Time, []int64, []int64, []int64, error) {
	aggFn, addFn, location, err := getClickhouseHistogramSettings(options)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	selectCols := fmt.Sprintf("%s(CreatedAt, '%s') as time, count() as count, sum(if(HasErrors, 1, 0)) as has_errors", aggFn, location.String())

	orderBy := fmt.Sprintf("1 WITH FILL FROM %s(?, '%s') TO %s(?, '%s') STEP 1", aggFn, location.String(), aggFn, location.String())

	sql, args, _, err := GetSessionsQueryImplDeprecated(admin, query, projectId, retentionDate, selectCols, pointy.String("1"), &orderBy, nil, nil)
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

var SessionsTableConfig = model.TableConfig{
	TableName:        SessionsTable,
	KeysToColumns:    fieldMap,
	AttributesColumn: "Fields",
	ReservedKeys: lo.Map(modelInputs.AllReservedSessionKey, func(item modelInputs.ReservedSessionKey, _ int) string {
		return item.String()
	}),
}

func SessionMatchesQuery(session *model.Session, filters listener.Filters) bool {
	return matchesQuery(session, SessionsTableConfig, filters, listener.OperatorAnd)
}

var reservedSessionKeys = lo.Map(modelInputs.AllReservedSessionKey, func(key modelInputs.ReservedSessionKey, _ int) string {
	return string(key)
})

var SessionsJoinedTableConfig = model.TableConfig{
	TableName:        SessionsJoinedTable,
	AttributesColumn: "RelevantFields",
	AttributesTable:  "fields",
	BodyColumn:       `concat(coalesce(nullif(arrayFilter((k, v) -> k = 'email', RelevantFields) [1].2,''), nullif(Identifier, ''), nullif(arrayFilter((k, v) -> k = 'device_id', RelevantFields) [1].2, ''), 'unidentified'), ': ', City, if(City != '', ', ', ''), Country)`,
	KeysToColumns: map[string]string{
		string(modelInputs.ReservedSessionKeyActiveLength):       "ActiveLength",
		string(modelInputs.ReservedSessionKeyServiceVersion):     "AppVersion",
		string(modelInputs.ReservedSessionKeyBrowserName):        "BrowserName",
		string(modelInputs.ReservedSessionKeyBrowserVersion):     "BrowserVersion",
		string(modelInputs.ReservedSessionKeyCity):               "City",
		string(modelInputs.ReservedSessionKeyCompleted):          "Processed",
		string(modelInputs.ReservedSessionKeyCountry):            "Country",
		string(modelInputs.ReservedSessionKeyEnvironment):        "Environment",
		string(modelInputs.ReservedSessionKeyExcluded):           "Excluded",
		string(modelInputs.ReservedSessionKeyFirstTime):          "FirstTime",
		string(modelInputs.ReservedSessionKeyHasComments):        "HasComments",
		string(modelInputs.ReservedSessionKeyHasErrors):          "HasErrors",
		string(modelInputs.ReservedSessionKeyHasRageClicks):      "HasRageClicks",
		string(modelInputs.ReservedSessionKeyIdentified):         "Identified",
		string(modelInputs.ReservedSessionKeyIdentifier):         "Identifier",
		string(modelInputs.ReservedSessionKeyIP):                 "IP",
		string(modelInputs.ReservedSessionKeyLength):             "Length",
		string(modelInputs.ReservedSessionKeyNormalness):         "Normalness",
		string(modelInputs.ReservedSessionKeyOsName):             "OSName",
		string(modelInputs.ReservedSessionKeyOsVersion):          "OSVersion",
		string(modelInputs.ReservedSessionKeyPagesVisited):       "PagesVisited",
		string(modelInputs.ReservedSessionKeySecureID):           "SecureID",
		string(modelInputs.ReservedSessionKeyState):              "State",
		string(modelInputs.ReservedSessionKeyViewedByAnyone):     "Viewed",
		string(modelInputs.ReservedSessionKeyWithinBillingQuota): "WithinBillingQuota",

		// deprecated but kept in for backwards compatibility of search
		string(modelInputs.ReservedSessionKeyViewed):    "Viewed",
		string(modelInputs.ReservedSessionKeyProcessed): "Processed",
		string(modelInputs.ReservedSessionKeyLocState):  "State",
	},
	ReservedKeys: reservedSessionKeys,
	IgnoredFilters: map[string]bool{
		modelInputs.ReservedSessionKeySample.String():     true,
		modelInputs.ReservedSessionKeyViewedByMe.String(): true,
	},
	DefaultFilter: "excluded=false",
}

var SessionsSampleableTableConfig = SampleableTableConfig{
	tableConfig: SessionsJoinedTableConfig,
	useSampling: func(time.Duration) bool {
		return false
	},
}

func (client *Client) ReadSessionsMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: SessionsSampleableTableConfig,
		ProjectIDs:       []int{projectID},
		Params:           params,
		Column:           column,
		MetricTypes:      metricTypes,
		GroupBy:          groupBy,
		BucketCount:      nBuckets,
		BucketWindow:     bucketWindow,
		BucketBy:         bucketBy,
		Limit:            limit,
		LimitAggregator:  limitAggregator,
		LimitColumn:      limitColumn,
	})
}

func (client *Client) ReadWorkspaceSessionCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: SessionsSampleableTableConfig,
		ProjectIDs:       projectIDs,
		Params:           params,
		Column:           "",
		MetricTypes:      []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount},
		BucketCount:      pointy.Int(12),
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
	})
}

func (client *Client) SessionsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	sessionKeys, err := KeysAggregated(ctx, client, SessionKeysTable, projectID, startDate, endDate, query, typeArg)
	if err != nil {
		return nil, err
	}

	if query == nil || *query == "" {
		sessionKeys = append(sessionKeys, defaultSessionsKeys...)
	} else {
		queryLower := strings.ToLower(*query)
		for _, key := range defaultSessionsKeys {
			if strings.Contains(key.Name, queryLower) {
				sessionKeys = append(sessionKeys, key)
			}
		}
	}

	return sessionKeys, nil
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

func (client *Client) SessionsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, query *string, limit *int) ([]string, error) {
	if booleanKeys[keyName] {
		return []string{"true", "false"}, nil
	}

	limitCount := 10
	if limit != nil {
		limitCount = *limit
	}

	searchQuery := ""
	if query != nil {
		searchQuery = *query
	}

	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.
		Select("Value").
		From("fields").
		Where(sb.And(
			sb.Equal("ProjectID", projectID),
			sb.Equal("Name", keyName),
			fmt.Sprintf("Value ILIKE %s", sb.Var("%"+searchQuery+"%")),
			sb.Between("SessionCreatedAt", startDate, endDate))).
		GroupBy("1").
		OrderBy("count() DESC").
		Limit(limitCount).
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

func getAttributeFields(config model.TableConfig, filters listener.Filters) []string {
	attributeFields := []string{"email", "device_id"}
	for _, f := range filters {
		if f.Column == config.AttributesColumn {
			attributeFields = append(attributeFields, f.Key)
		}
		attributeFields = append(attributeFields, getAttributeFields(config, f.Filters)...)
	}
	return attributeFields
}

func addAttributes(config model.TableConfig, attributeFields []string, projectIds []int, params modelInputs.QueryInput, sb *sqlbuilder.SelectBuilder) {
	if config.AttributesTable != "" {
		joinSb := sqlbuilder.NewSelectBuilder()
		joinSb.From(config.AttributesTable).
			Select(fmt.Sprintf("SessionID, groupArray(tuple(Name, Value)) AS %s", config.AttributesColumn)).
			Where(joinSb.In("ProjectID", projectIds)).
			Where(joinSb.GreaterEqualThan("SessionCreatedAt", params.DateRange.StartDate)).
			Where(joinSb.LessEqualThan("SessionCreatedAt", params.DateRange.EndDate)).
			Where(joinSb.In("Name", attributeFields)).
			GroupBy("SessionID")
		sb.JoinWithOption(sqlbuilder.InnerJoin, sb.BuilderAs(joinSb, "join"), "ID = SessionID")
	}
}

func GetSessionsQueryImpl(admin *model.Admin, params modelInputs.QueryInput, projectId int, retentionDate time.Time, selectColumns string, groupBy *string, orderBy *string, limit *int, offset *int) (string, []interface{}, bool, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.From(fmt.Sprintf("%s FINAL", SessionsJoinedTableConfig.TableName))

	sb.Where(sb.And(sb.Equal("ProjectID", projectId),
		"NOT Excluded",
		"WithinBillingQuota"),
		sb.GreaterThan("CreatedAt", retentionDate),
	)
	sb.Where(sb.LessEqualThan("CreatedAt", params.DateRange.EndDate)).
		Where(sb.GreaterEqualThan("CreatedAt", params.DateRange.StartDate))

	listener := parser.GetSearchListener(sb, params.Query, SessionsJoinedTableConfig)
	parser.GetSearchFilters(params.Query, SessionsJoinedTableConfig, listener)

	useViewedByMe := listener.IgnoredFilters != nil && listener.IgnoredFilters[modelInputs.ReservedSessionKeyViewedByMe.String()] != ""
	if useViewedByMe {
		viewedByMe := listener.IgnoredFilters[modelInputs.ReservedSessionKeyViewedByMe.String()]
		if viewedByMe == "true" {
			sb.Where(fmt.Sprintf("has(ViewedByAdmins, %d)", admin.ID))
		} else {
			sb.Where(fmt.Sprintf("NOT has(ViewedByAdmins, %d)", admin.ID))
		}
	}

	useRandomSample := listener.IgnoredFilters != nil && listener.IgnoredFilters[modelInputs.ReservedSessionKeySample.String()] != ""
	if useRandomSample {
		sampleRule := listener.IgnoredFilters[modelInputs.ReservedSessionKeySample.String()]
		salt, err := strconv.ParseUint(sampleRule, 16, 64)
		if err != nil {
			return "", nil, false, err
		}
		selectColumns = fmt.Sprintf("%s, toUInt64(farmHash64(SecureID) %% %d) as hash", selectColumns, salt)
		orderBy = pointy.String("hash")
	}

	sb.Select(selectColumns)

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

	attributeFields := getAttributeFields(SessionsJoinedTableConfig, listener.GetFilters())
	addAttributes(SessionsJoinedTableConfig, attributeFields, []int{projectId}, params, sb)

	if useRandomSample {
		sbOuter := sqlbuilder.NewSelectBuilder()
		sb = sbOuter.
			Select("*").
			From(sbOuter.BuilderAs(sb, "inner"))
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	return sql, args, useRandomSample, nil
}

func (client *Client) QuerySessionIds(ctx context.Context, admin *model.Admin, projectId int, count int, params modelInputs.QueryInput, sortField string, page *int, retentionDate time.Time) ([]int64, int64, bool, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, sampleRuleFound, err := GetSessionsQueryImpl(admin, params, projectId, retentionDate, "ID, count() OVER() AS total", nil, pointy.String(sortField), pointy.Int(count), pointy.Int(offset))
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

func (client *Client) QuerySessionHistogram(ctx context.Context, admin *model.Admin, projectId int, params modelInputs.QueryInput, retentionDate time.Time, options modelInputs.DateHistogramOptions) ([]time.Time, []int64, []int64, []int64, error) {
	aggFn, addFn, location, err := getClickhouseHistogramSettings(options)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	selectCols := fmt.Sprintf("%s(CreatedAt, '%s') as time, count() as count, sum(if(HasErrors, 1, 0)) as has_errors", aggFn, location.String())

	orderBy := fmt.Sprintf("1 WITH FILL FROM %s(?, '%s') TO %s(?, '%s') STEP 1", aggFn, location.String(), aggFn, location.String())

	sql, args, _, err := GetSessionsQueryImpl(admin, params, projectId, retentionDate, selectCols, pointy.String("1"), &orderBy, nil, nil)
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

func (client *Client) SessionsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, SessionsJoinedTableConfig, projectID, params)
}

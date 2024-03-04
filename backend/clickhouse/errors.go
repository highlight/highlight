package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/parser/listener"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	model2 "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
)

type ClickhouseErrorGroup struct {
	ProjectID           int32
	CreatedAt           int64
	UpdatedAt           int64
	ID                  int64
	Event               string
	Status              string
	Type                string
	ErrorTagID          int64
	ErrorTagTitle       string
	ErrorTagDescription string
}

type ClickhouseErrorObject struct {
	ProjectID       int32
	Timestamp       int64
	ErrorGroupID    int64
	HasSession      bool
	ID              int64
	Browser         string
	Environment     string
	OSName          string
	ServiceName     string
	ServiceVersion  string
	ClientID        string
	VisitedURL      string
	TraceID         string
	SecureSessionID string
}

const ErrorGroupsTable = "error_groups"
const ErrorObjectsTable = "error_objects"
const errorsTimeRangeField = "error-field_timestamp"

func (client *Client) WriteErrorGroups(ctx context.Context, groups []*model.ErrorGroup) error {
	chGroups := []interface{}{}

	for _, group := range groups {
		if group == nil {
			return errors.New("nil group")
		}

		chEg := ClickhouseErrorGroup{
			ProjectID: int32(group.ProjectID),
			CreatedAt: group.CreatedAt.UTC().UnixMicro(),
			UpdatedAt: group.UpdatedAt.UTC().UnixMicro(),
			ID:        int64(group.ID),
			Event:     group.Event,
			Status:    string(group.State),
			Type:      group.Type,
		}
		if group.ErrorTag != nil {
			chEg.ErrorTagID = int64(group.ErrorTag.ID)
			chEg.ErrorTagTitle = group.ErrorTag.Title
			chEg.ErrorTagDescription = group.ErrorTag.Description
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
		sql, args = replaceTimestampInserts(sql, args, 10, map[int]bool{1: true, 2: true}, MicroSeconds)
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

		hasSession := false
		clientId := ""
		secureSessionId := ""
		if object.SessionID != nil {
			relatedSession := sessionsById[*object.SessionID]
			if relatedSession != nil {
				clientId = relatedSession.ClientID
				hasSession = !relatedSession.Excluded
				secureSessionId = relatedSession.SecureID
			}
		}

		traceId := ""
		if object.TraceID != nil {
			traceId = *object.TraceID
		}

		chEg := ClickhouseErrorObject{
			ProjectID:       int32(object.ProjectID),
			Timestamp:       object.Timestamp.UTC().UnixMicro(),
			ErrorGroupID:    int64(object.ErrorGroupID),
			HasSession:      hasSession,
			ID:              int64(object.ID),
			Browser:         object.Browser,
			Environment:     object.Environment,
			OSName:          object.OS,
			ServiceName:     object.ServiceName,
			ServiceVersion:  object.ServiceVersion,
			ClientID:        clientId,
			VisitedURL:      object.URL,
			TraceID:         traceId,
			SecureSessionID: secureSessionId,
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
		sql, args = replaceTimestampInserts(sql, args, 14, map[int]bool{1: true}, MicroSeconds)
		return client.conn.Exec(chCtx, sql, args...)
	}

	return nil
}

func getErrorQueryImpl(tableName string, selectColumns string, query modelInputs.ClickhouseQuery, projectId int, retentionDate time.Time, groupBy *string, orderBy *string, limit *int, offset *int) (string, []interface{}, error) {
	rules, err := deserializeRules(query.Rules)
	if err != nil {
		return "", nil, err
	}

	end := query.DateRange.EndDate.UTC()
	start := query.DateRange.StartDate.UTC()
	timeRangeRule := Rule{
		Field: errorsTimeRangeField,
		Op:    BetweenDate,
		Val:   []string{fmt.Sprintf("%s_%s", start.Format(timeFormat), end.Format(timeFormat))},
	}
	rules = append(rules, timeRangeRule)

	sb, err := parseErrorRules(tableName, selectColumns, query.IsAnd, rules, projectId, start, end)
	if err != nil {
		return "", nil, err
	}

	if groupBy != nil {
		sb.GroupBy(*groupBy)
	}
	if orderBy != nil {
		sb.OrderBy(*orderBy)
	}
	if limit != nil {
		sb.Limit(*limit)
	}
	if offset != nil {
		sb.Offset(*offset)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	return sql, args, nil
}

func (client *Client) QueryErrorGroupIds(ctx context.Context, projectId int, count int, query modelInputs.ClickhouseQuery, page *int, retentionDate time.Time) ([]int64, int64, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, err := getErrorQueryImpl(ErrorGroupsTable, "ID, count() OVER() AS total", query, projectId, retentionDate, nil, pointy.String("UpdatedAt DESC, ID DESC"), pointy.Int(count), pointy.Int(offset))
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

func (client *Client) QueryErrorGroupFrequencies(ctx context.Context, projectId int, errorGroupIds []int, params modelInputs.ErrorGroupFrequenciesParamsInput) ([]*modelInputs.ErrorDistributionItem, error) {
	if params.DateRange == nil {
		return nil, errors.New("params.DateRange must not be nil")
	}

	sb := sqlbuilder.NewSelectBuilder()

	mins := params.ResolutionMinutes

	builders := []sqlbuilder.Builder{}
	sbInner := sqlbuilder.NewSelectBuilder()
	sbInner.Select(fmt.Sprintf("ErrorGroupID, intDiv(toRelativeMinuteNum(Timestamp), %s) AS index, count(*) AS count", sbInner.Var(mins))).
		From("error_objects FINAL").
		Where(sbInner.Equal("ProjectID", projectId)).
		Where(sbInner.In("ErrorGroupID", errorGroupIds)).
		Where(sbInner.Between("Timestamp", params.DateRange.StartDate, params.DateRange.EndDate)).
		GroupBy("1, 2")
	builders = append(builders, sbInner)

	for _, id := range errorGroupIds {
		defaultInner := sqlbuilder.Buildf(`
			SELECT %s as ErrorGroupID, intDiv(toRelativeMinuteNum(%s), %s), 0
			ORDER BY
				1 WITH FILL,
				2 WITH FILL FROM intDiv(toRelativeMinuteNum(%s), %s) TO intDiv(toRelativeMinuteNum(%s), %s)`,
			id, params.DateRange.StartDate, mins, params.DateRange.StartDate, mins, params.DateRange.EndDate, mins)
		builders = append(builders, defaultInner)
	}

	sql, args := sb.Select(fmt.Sprintf("ErrorGroupID, addMinutes(makeDate(0, 0), index * %s), sum(count)", sb.Var(mins))).
		From(sb.BuilderAs(sqlbuilder.UnionAll(builders...), "inner")).
		GroupBy("1, 2").
		OrderBy("1, 2").
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	items := []*modelInputs.ErrorDistributionItem{}

	for rows.Next() {
		var errorGroupId int64
		var date time.Time
		var count uint64

		if err := rows.Scan(&errorGroupId, &date, &count); err != nil {
			return nil, err
		}

		items = append(items, &modelInputs.ErrorDistributionItem{
			ErrorGroupID: int(errorGroupId),
			Date:         date,
			Name:         "count",
			Value:        int64(count),
		})
	}

	return items, err
}

func (client *Client) QueryErrorGroupAggregateFrequency(ctx context.Context, projectId int, errorGroupIds []int) ([]*modelInputs.ErrorDistributionItem, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.Select(`ErrorGroupID,
		now(),
		countIf(Timestamp >= now() - INTERVAL 30 DAY) as monthCount,
		uniqIf(ClientID, Timestamp >= now() - INTERVAL 30 DAY) as monthIdentifierCount,
		countIf(Timestamp >= now() - INTERVAL 7 DAY) as weekCount,
		uniqIf(ClientID, Timestamp >= now() - INTERVAL 7 DAY) as weekIdentifierCount,
		countIf(Timestamp BETWEEN now() - INTERVAL 14 DAY AND now() - INTERVAL 7 DAY) as prevWeekCount,
		uniqIf(ClientID, Timestamp BETWEEN now() - INTERVAL 14 DAY AND now() - INTERVAL 7 DAY) as prevWeekIdentifierCount`).
		From("error_objects FINAL").
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.In("ErrorGroupID", errorGroupIds)).
		GroupBy("1").
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	items := []*modelInputs.ErrorDistributionItem{}

	for rows.Next() {
		var errorGroupId int64
		var now time.Time
		var monthCount uint64
		var monthIdentifierCount uint64
		var weekCount uint64
		var weekIdentifierCount uint64
		var prevWeekCount uint64
		var prevWeekIdentifierCount uint64

		if err := rows.Scan(&errorGroupId, &now, &monthCount, &monthIdentifierCount,
			&weekCount, &weekIdentifierCount, &prevWeekCount, &prevWeekIdentifierCount); err != nil {
			return nil, err
		}

		items = append(items, &modelInputs.ErrorDistributionItem{
			ErrorGroupID: int(errorGroupId),
			Date:         now.AddDate(0, 0, -30),
			Name:         "monthCount",
			Value:        int64(monthCount),
		})

		items = append(items, &modelInputs.ErrorDistributionItem{
			ErrorGroupID: int(errorGroupId),
			Date:         now.AddDate(0, 0, -30),
			Name:         "monthIdentifierCount",
			Value:        int64(monthIdentifierCount),
		})

		items = append(items, &modelInputs.ErrorDistributionItem{
			ErrorGroupID: int(errorGroupId),
			Date:         now.AddDate(0, 0, -14),
			Name:         "weekCount",
			Value:        int64(prevWeekCount),
		})

		items = append(items, &modelInputs.ErrorDistributionItem{
			ErrorGroupID: int(errorGroupId),
			Date:         now.AddDate(0, 0, -14),
			Name:         "weekIdentifierCount",
			Value:        int64(prevWeekIdentifierCount),
		})

		items = append(items, &modelInputs.ErrorDistributionItem{
			ErrorGroupID: int(errorGroupId),
			Date:         now.AddDate(0, 0, -7),
			Name:         "weekCount",
			Value:        int64(weekCount),
		})

		items = append(items, &modelInputs.ErrorDistributionItem{
			ErrorGroupID: int(errorGroupId),
			Date:         now.AddDate(0, 0, -7),
			Name:         "weekIdentifierCount",
			Value:        int64(weekIdentifierCount),
		})
	}

	return items, err
}

func (client *Client) QueryErrorGroupOccurrences(ctx context.Context, projectId int, errorGroupId int) (*time.Time, *time.Time, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.Select(`
		min(Timestamp) as firstOccurrence,
		max(Timestamp) as lastOccurrence`).
		From("error_objects FINAL").
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.Equal("ErrorGroupID", errorGroupId)).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, nil, err
	}

	var firstOccurrence time.Time
	var lastOccurrence time.Time
	for rows.Next() {
		if err := rows.Scan(&firstOccurrence, &lastOccurrence); err != nil {
			return nil, nil, err
		}
	}

	return &firstOccurrence, &lastOccurrence, nil
}

func (client *Client) QueryErrorGroupTags(ctx context.Context, projectId int, errorGroupId int) ([]*modelInputs.ErrorGroupTagAggregation, error) {
	tags := map[string]string{
		"browser":     "Browser",
		"environment": "Environment",
		"os_name":     "OSName",
	}

	builders := []sqlbuilder.Builder{}
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("'total', 'total', count(*)").
		From("error_objects FINAL").
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.Equal("ErrorGroupID", errorGroupId))
	builders = append(builders, sb)

	for key, bucket := range tags {
		sb := sqlbuilder.NewSelectBuilder()
		sb.Select(fmt.Sprintf("'%s', %s, count(*)", key, bucket)).
			From("error_objects FINAL").
			Where(sb.Equal("ProjectID", projectId)).
			Where(sb.Equal("ErrorGroupID", errorGroupId)).
			GroupBy(bucket)
		builders = append(builders, sb)
	}

	sql, args := sqlbuilder.UnionAll(builders...).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	aggs := map[string]*modelInputs.ErrorGroupTagAggregation{}
	for key := range tags {
		aggs[key] = &modelInputs.ErrorGroupTagAggregation{
			Key:     key,
			Buckets: []*modelInputs.ErrorGroupTagAggregationBucket{},
		}
	}

	var total uint64
	for rows.Next() {
		var key string
		var bucket string
		var count uint64
		if err := rows.Scan(&key, &bucket, &count); err != nil {
			return nil, err
		}
		if key == "total" {
			total = count
		} else {
			aggs[key].Buckets = append(aggs[key].Buckets, &modelInputs.ErrorGroupTagAggregationBucket{
				Key:      bucket,
				DocCount: int64(count),
				Percent:  float64(count) / float64(total),
			})
		}
	}

	return lo.Values(aggs), nil
}

func (client *Client) QueryErrorFieldValues(ctx context.Context, projectId int, count int, fieldType string, fieldName string, query string, start time.Time, end time.Time) ([]string, error) {
	mappedName, found := fieldMap[fieldName]
	if !found {
		return nil, fmt.Errorf("unknown column %s", fieldName)
	}

	table := ErrorGroupsTable
	if fieldType == "error-field" {
		table = ErrorObjectsTable
	}

	sb := sqlbuilder.NewSelectBuilder()
	sb = sb.
		Select(mappedName).
		From(table).
		Where(sb.Equal("ProjectID", projectId)).
		Where(fmt.Sprintf("%s ILIKE %s", mappedName, sb.Var("%"+query+"%"))).
		Where(fmt.Sprintf("%s <> ''", mappedName))

	if table == ErrorGroupsTable {
		sb = sb.Where(sb.Or(
			sb.Between("CreatedAt", start, end),
			sb.Between("UpdatedAt", start, end)))
	} else {
		sb = sb.Where(sb.Between("Timestamp", start, end))
	}

	sql, args := sb.GroupBy("1").
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

func (client *Client) QueryErrorHistogram(ctx context.Context, projectId int, query modelInputs.ClickhouseQuery, retentionDate time.Time, options modelInputs.DateHistogramOptions) ([]time.Time, []int64, error) {
	aggFn, addFn, location, err := getClickhouseHistogramSettings(options)
	if err != nil {
		return nil, nil, err
	}

	selectCols := fmt.Sprintf("%s(Timestamp, '%s') as time, count() as count", aggFn, location.String())

	orderBy := fmt.Sprintf("1 WITH FILL FROM %s(?, '%s') TO %s(?, '%s') STEP 1", aggFn, location.String(), aggFn, location.String())

	sql, args, err := getErrorQueryImpl(ErrorObjectsTable, selectCols, query, projectId, retentionDate, pointy.String("1"), &orderBy, nil, nil)
	if err != nil {
		return nil, nil, err
	}
	args = append(args, *options.Bounds.StartDate, *options.Bounds.EndDate)
	sql = fmt.Sprintf("SELECT %s(makeDate(0, 0), time), count from (%s)", addFn, sql)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, nil, err
	}

	bucketTimes := []time.Time{}
	totals := []int64{}
	for rows.Next() {
		var time time.Time
		var total uint64
		if err := rows.Scan(&time, &total); err != nil {
			return nil, nil, err
		}
		bucketTimes = append(bucketTimes, time)
		totals = append(totals, int64(total))
	}

	return bucketTimes, totals, nil
}

var ErrorObjectsTableConfig = model.TableConfig[modelInputs.ReservedErrorObjectKey]{
	TableName: ErrorObjectsTable,
	KeysToColumns: map[modelInputs.ReservedErrorObjectKey]string{
		modelInputs.ReservedErrorObjectKeyBrowser:         "Browser",
		modelInputs.ReservedErrorObjectKeyClientID:        "ClientID",
		modelInputs.ReservedErrorObjectKeyEnvironment:     "Environment",
		modelInputs.ReservedErrorObjectKeyHasSession:      "HasSession",
		modelInputs.ReservedErrorObjectKeyOsName:          "OSName",
		modelInputs.ReservedErrorObjectKeySecureSessionID: "SecureSessionID",
		modelInputs.ReservedErrorObjectKeyServiceName:     "ServiceName",
		modelInputs.ReservedErrorObjectKeyServiceVersion:  "ServiceVersion",
		modelInputs.ReservedErrorObjectKeyTimestamp:       "Timestamp",
		modelInputs.ReservedErrorObjectKeyTraceID:         "TraceID",
		modelInputs.ReservedErrorObjectKeyVisitedURL:      "VisitedURL",
	},
	ReservedKeys: modelInputs.AllReservedErrorObjectKey,
}

var errorsJoinedTableConfig = model.TableConfig[modelInputs.ReservedErrorsJoinedKey]{
	TableName: "errors_joined_vw",
	KeysToColumns: map[modelInputs.ReservedErrorsJoinedKey]string{
		modelInputs.ReservedErrorsJoinedKeyBrowser:        "Browser",
		modelInputs.ReservedErrorsJoinedKeyClientID:       "ClientID",
		modelInputs.ReservedErrorsJoinedKeyEnvironment:    "Environment",
		modelInputs.ReservedErrorsJoinedKeyEvent:          "Event",
		modelInputs.ReservedErrorsJoinedKeyHasSession:     "HasSession",
		modelInputs.ReservedErrorsJoinedKeyOsName:         "OSName",
		modelInputs.ReservedErrorsJoinedKeyServiceName:    "ServiceName",
		modelInputs.ReservedErrorsJoinedKeyServiceVersion: "ServiceVersion",
		modelInputs.ReservedErrorsJoinedKeyTag:            "ErrorTagTitle",
		modelInputs.ReservedErrorsJoinedKeyType:           "Type",
		modelInputs.ReservedErrorsJoinedKeyVisitedURL:     "VisitedURL",
		modelInputs.ReservedErrorsJoinedKeyTimestamp:      "Timestamp",
		modelInputs.ReservedErrorsJoinedKeyStatus:         "Status",
	},
	BodyColumn:   "Event",
	ReservedKeys: modelInputs.AllReservedErrorsJoinedKey,
}

var errorsSampleableTableConfig = sampleableTableConfig[modelInputs.ReservedErrorsJoinedKey]{
	tableConfig: errorsJoinedTableConfig,
	useSampling: func(time.Duration) bool {
		return false
	},
}

func ErrorMatchesQuery(errorObject *model2.BackendErrorObjectInput, filters listener.Filters) bool {
	return matchesQuery(errorObject, errorsJoinedTableConfig, filters)
}

func (client *Client) ReadErrorsMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return readMetrics(ctx, client, errorsSampleableTableConfig, projectID, params, column, metricTypes, groupBy, nBuckets, bucketBy, limit, limitAggregator, limitColumn)
}

func (client *Client) ErrorsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	var tableName string
	if ok := modelInputs.ReservedErrorGroupKey(keyName).IsValid(); ok {
		tableName = ErrorGroupsTable
	} else if ok := modelInputs.ReservedErrorObjectKey(keyName).IsValid(); ok {
		tableName = ErrorObjectsTable
	} else {
		return nil, fmt.Errorf("unknown error key %s", keyName)
	}

	return client.QueryErrorFieldValues(ctx, projectID, 10, tableName, keyName, "", startDate, endDate)
}

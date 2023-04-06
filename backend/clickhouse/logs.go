package clickhouse

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"
	"unicode"

	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	"github.com/google/uuid"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	flat "github.com/nqd/flat"
	e "github.com/pkg/errors"
)

const LogsTable = "logs"
const LogsKeysMV = "log_keys_hourly_mv"

func (client *Client) BatchWriteLogRows(ctx context.Context, logRows []*LogRow) error {
	if len(logRows) == 0 {
		return nil
	}
	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", LogsTable))

	if err != nil {
		return e.Wrap(err, "failed to create logs batch")
	}

	for _, logRow := range logRows {
		if len(logRow.UUID) == 0 {
			logRow.UUID = uuid.New().String()
		}
		err = batch.AppendStruct(logRow)
		if err != nil {
			return err
		}
	}
	return batch.Send()
}

const LogsLimit int = 50
const KeyValuesLimit int = 50

const OrderBackwardNatural = "Timestamp ASC, UUID ASC"
const OrderForwardNatural = "Timestamp DESC, UUID DESC"

const OrderBackwardInverted = "Timestamp DESC, UUID DESC"
const OrderForwardInverted = "Timestamp ASC, UUID ASC"

type Pagination struct {
	After     *string
	Before    *string
	At        *string
	Direction modelInputs.LogDirection
	CountOnly bool
}

func (client *Client) ReadLogs(ctx context.Context, projectID int, params modelInputs.LogsParamsInput, pagination Pagination) (*modelInputs.LogsConnection, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}
	selectStr := "Timestamp, UUID, SeverityText, Body, LogAttributes, TraceId, SpanId, SecureSessionId, Source, ServiceName"

	orderForward := OrderForwardNatural
	orderBackward := OrderBackwardNatural
	if pagination.Direction == modelInputs.LogDirectionAsc {
		orderForward = OrderForwardInverted
		orderBackward = OrderBackwardInverted
	}

	if pagination.At != nil && len(*pagination.At) > 1 {
		// Create a "window" around the cursor
		// https://stackoverflow.com/a/71738696
		beforeSb, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			Before: pagination.At,
		}, orderBackward, orderForward)
		if err != nil {
			return nil, err
		}
		beforeSb.Limit(LogsLimit/2 + 1)

		atSb, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			At: pagination.At,
		}, orderBackward, orderForward)
		if err != nil {
			return nil, err
		}

		afterSb, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			After: pagination.At,
		}, orderBackward, orderForward)
		if err != nil {
			return nil, err
		}
		afterSb.Limit(LogsLimit/2 + 1)

		ub := sqlbuilder.UnionAll(beforeSb, atSb, afterSb)
		sb.Select(selectStr).From(sb.BuilderAs(ub, "logs_window")).OrderBy(orderForward)
	} else {
		fromSb, err := makeSelectBuilder(selectStr, projectID, params, pagination, orderBackward, orderForward)
		if err != nil {
			return nil, err
		}

		fromSb.Limit(LogsLimit + 1)
		sb.Select(selectStr).From(sb.BuilderAs(fromSb, "logs_window")).OrderBy(orderForward)
	}

	sql, args := sb.Build()

	span, _ := tracer.StartSpanFromContext(ctx, "logs", tracer.ResourceName("ReadLogs"))
	query, err := sqlbuilder.ClickHouse.Interpolate(sql, args)
	if err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}
	span.SetTag("Query", query)
	span.SetTag("Params", params)

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}

	edges := []*modelInputs.LogEdge{}

	for rows.Next() {
		var result struct {
			Timestamp       time.Time
			UUID            string
			SeverityText    string
			Body            string
			LogAttributes   map[string]string
			TraceId         string
			SpanId          string
			SecureSessionId string
			Source          string
			ServiceName     string
		}
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		edges = append(edges, &modelInputs.LogEdge{
			Cursor: encodeCursor(result.Timestamp, result.UUID),
			Node: &modelInputs.Log{
				Timestamp:       result.Timestamp,
				Level:           makeLogLevel(result.SeverityText),
				Message:         result.Body,
				LogAttributes:   expandJSON(result.LogAttributes),
				TraceID:         &result.TraceId,
				SpanID:          &result.SpanId,
				SecureSessionID: &result.SecureSessionId,
				Source:          &result.Source,
				ServiceName:     &result.ServiceName,
			},
		})
	}
	rows.Close()

	span.Finish(tracer.WithError(rows.Err()))
	return getLogsConnection(edges, pagination), rows.Err()
}

func (client *Client) ReadLogsTotalCount(ctx context.Context, projectID int, params modelInputs.LogsParamsInput) (uint64, error) {
	sb, err := makeSelectBuilder("COUNT(*)", projectID, params, Pagination{CountOnly: true}, OrderBackwardNatural, OrderForwardNatural)
	if err != nil {
		return 0, err
	}

	sql, args := sb.Build()

	var count uint64
	err = client.conn.QueryRow(
		ctx,
		sql,
		args...,
	).Scan(&count)

	return count, err
}

func (client *Client) ReadLogsHistogram(ctx context.Context, projectID int, params modelInputs.LogsParamsInput, nBuckets int) (*modelInputs.LogsHistogram, error) {
	startTimestamp := uint64(params.DateRange.StartDate.Unix())
	endTimestamp := uint64(params.DateRange.EndDate.Unix())

	fromSb, err := makeSelectBuilder(
		fmt.Sprintf(
			"toUInt64(floor(%d * (toUInt64(Timestamp) - %d) / (%d - %d))) AS bucketId, SeverityText AS level",
			nBuckets,
			startTimestamp,
			endTimestamp,
			startTimestamp,
		),
		projectID,
		params,
		Pagination{},
		OrderBackwardNatural,
		OrderForwardNatural,
	)

	if err != nil {
		return nil, err
	}

	sb := sqlbuilder.NewSelectBuilder()

	sb.
		Select("bucketId, level, count()").
		From(sb.BuilderAs(fromSb, LogsTable)).
		GroupBy("bucketId, level").
		OrderBy("bucketId, level")

	sql, args := sb.Build()

	histogram := &modelInputs.LogsHistogram{
		Buckets:    make([]*modelInputs.LogsHistogramBucket, 0, nBuckets),
		TotalCount: uint64(nBuckets),
	}

	rows, err := client.conn.Query(
		ctx,
		sql,
		args...,
	)

	if err != nil {
		return nil, err
	}

	var (
		bucketId uint64
		level    string
		count    uint64
	)

	buckets := make(map[uint64]map[modelInputs.LogLevel]uint64)

	for rows.Next() {
		if err := rows.Scan(&bucketId, &level, &count); err != nil {
			return nil, err
		}
		// clamp bucket to [0, nBuckets)
		if bucketId >= uint64(nBuckets) {
			bucketId = uint64(nBuckets - 1)
		}

		// create bucket if not exists
		if _, ok := buckets[bucketId]; !ok {
			buckets[bucketId] = make(map[modelInputs.LogLevel]uint64)
		}

		// add count to bucket
		buckets[bucketId][makeLogLevel(level)] = count
	}

	for bucketId = uint64(0); bucketId < uint64(nBuckets); bucketId++ {
		if _, ok := buckets[bucketId]; !ok {
			continue
		}
		bucket := buckets[bucketId]
		counts := make([]*modelInputs.LogsHistogramBucketCount, 0, len(bucket))
		for _, level := range modelInputs.AllLogLevel {
			if _, ok := bucket[level]; !ok {
				bucket[level] = 0
			}
			counts = append(counts, &modelInputs.LogsHistogramBucketCount{
				Level: level,
				Count: bucket[level],
			})
		}

		histogram.Buckets = append(histogram.Buckets, &modelInputs.LogsHistogramBucket{
			BucketID: bucketId,
			Counts:   counts,
		})
	}

	return histogram, err
}

/**
 * Fetching the keys involves an aggregation and hence we optimize the data fetching to pull from an hourly materialized view (MV) when possible
 * and using the raw logs table for anything that isn't possible to fetch from the MV. The results are then merged together.
 *
 * Example:
 * now = 4:45PM
 * Time range = "Last 4 hours" (12:45PM - 4:45PM) where startDate = 12:45PM and endDate = 4:45PM
 *
 * 4:00PM -> 4:45PM - fetch from raw logs table
 * 1:00 -> 4:00PM - fetch from MV
 * 12:45 -> 1:00PM - fetch from raw logs table
 */
func (client *Client) LogsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time) ([]*modelInputs.LogKey, error) {

	span, _ := tracer.StartSpanFromContext(ctx, "logs", tracer.ResourceName("LogsKeys"))

	type keyCount struct {
		Key   string
		Total uint64
	}

	mvEndHour := endDate.Truncate(time.Hour)                        // get the floor of endDate
	mvStartHour := startDate.Add(1 * time.Hour).Truncate(time.Hour) // gets the ceiling of startDate

	fmt.Println(mvStartHour.Format("01-02-2006 15:04:05"))
	fmt.Println(mvEndHour.Format("01-02-2006 15:04:05"))

	var rawKeyCounts []keyCount
	var mvKeyCounts []keyCount

	mappedKeyCount := make(map[string]uint64) // For usage of merging the previous results together

	sb := sqlbuilder.NewSelectBuilder().From(LogsTable)
	sb.Select("arrayJoin(LogAttributes.keys) as Key, count() as Total").
		From(LogsTable).
		Where(sb.Equal("ProjectId", projectID)).
		Where(
			sb.Or(
				sb.And(
					sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(endDate.Unix())),
					sb.GreaterThan("toUInt64(toDateTime(Timestamp))", uint64(mvEndHour.Unix())),
				),
				sb.And(
					sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(startDate.Unix())),
					sb.LessThan("toUInt64(toDateTime(Timestamp))", uint64(mvStartHour.Unix())),
				),
			),
		).
		GroupBy("Key").
		OrderBy("Total DESC")

	sql, args := sb.Build()

	recentSQL, err := sqlbuilder.ClickHouse.Interpolate(sql, args)
	if err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}
	span.SetTag("RecentSQL", recentSQL)

	if err := client.conn.Select(ctx, &rawKeyCounts, sql, args...); err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}

	for _, keyCount := range rawKeyCounts {
		mappedKeyCount[keyCount.Key] += keyCount.Total
	}

	mv := sqlbuilder.NewSelectBuilder().From(LogsKeysMV)
	mv.Select("Key, sum(Count) as Total").
		From(LogsKeysMV).
		Where(mv.Equal("ProjectId", projectID)).
		Where(mv.LessEqualThan("toUInt64(toDateTime(Hour))", uint64(mvEndHour.Unix()))).
		Where(mv.GreaterEqualThan("toUInt64(toDateTime(Hour))", uint64(mvStartHour.Unix()))).
		GroupBy("Key").
		OrderBy("Total DESC")

	sql, args = mv.Build()

	olderSQL, err := sqlbuilder.ClickHouse.Interpolate(sql, args)
	if err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}
	span.SetTag("OlderSQL", olderSQL)

	if err := client.conn.Select(ctx, &mvKeyCounts, sql, args...); err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}

	for _, keyCount := range mvKeyCounts {
		mappedKeyCount[keyCount.Key] += keyCount.Total
	}

	var sortedKeyCounts []keyCount
	for k, v := range mappedKeyCount {
		sortedKeyCounts = append(sortedKeyCounts, keyCount{k, v})
	}
	sort.Slice(sortedKeyCounts, func(i, j int) bool {
		return sortedKeyCounts[i].Total > sortedKeyCounts[j].Total
	})

	keys := []*modelInputs.LogKey{}
	for _, keyCount := range sortedKeyCounts {
		keys = append(keys, &modelInputs.LogKey{
			Name: keyCount.Key,
			Type: modelInputs.LogKeyTypeString, // For now, assume everything is a string
		})
	}

	for _, key := range modelInputs.AllReservedLogKey {
		keys = append(keys, &modelInputs.LogKey{
			Name: key.String(),
			Type: modelInputs.LogKeyTypeString,
		})
	}

	span.Finish()
	return keys, nil

}

func (client *Client) LogsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()

	switch keyName {
	case modelInputs.ReservedLogKeyLevel.String():
		sb.Select("DISTINCT SeverityText level").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("level", "")).
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeySecureSessionID.String():
		sb.Select("DISTINCT SecureSessionId secure_session_id").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("secure_session_id", "")).
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeySpanID.String():
		sb.Select("DISTINCT SpanId span_id").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("span_id", "")).
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeyTraceID.String():
		sb.Select("DISTINCT TraceId trace_id").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("trace_id", "")).
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeySource.String():
		sb.Select("DISTINCT Source source").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("source", "")).
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeyServiceName.String():
		sb.Select("DISTINCT ServiceName service_name").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("service_name", "")).
			Limit(KeyValuesLimit)
	default:
		sb.Select("DISTINCT LogAttributes [" + sb.Var(keyName) + "] as value").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where("mapContains(LogAttributes, " + sb.Var(keyName) + ")").
			Limit(KeyValuesLimit)
	}

	sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(endDate.Unix()))).
		Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(startDate.Unix())))

	sql, args := sb.Build()

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		return nil, err
	}

	values := []string{}
	for rows.Next() {
		var (
			Value string
		)
		if err := rows.Scan(&Value); err != nil {
			return nil, err
		}

		values = append(values, Value)
	}

	rows.Close()

	return values, rows.Err()
}

func makeSelectBuilder(selectStr string, projectID int, params modelInputs.LogsParamsInput, pagination Pagination, orderBackward string, orderForward string) (*sqlbuilder.SelectBuilder, error) {
	filters := makeFilters(params.Query)
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(selectStr).From(LogsTable)

	// Clickhouse requires that PREWHERE clauses occur before WHERE clauses
	// sql-builder doesn't support PREWHERE natively so we use `SQL` which sets a marker
	// of where to place the raw SQL later when it is being built.
	// In this case, we are placing the marker after the `FROM` clause
	preWheres := []string{}
	for _, body := range filters.body {
		if strings.Contains(body, "%") {
			sb.Where("Body ILIKE" + sb.Var(body))
		} else {
			preWheres = append(preWheres, "hasTokenCaseInsensitive(Body, "+sb.Var(body)+")")
		}
	}

	if len(preWheres) > 0 {
		sb.SQL("PREWHERE " + strings.Join(preWheres, " AND "))
	}

	sb.Where(sb.Equal("ProjectId", projectID))

	if pagination.After != nil && len(*pagination.After) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.After)
		if err != nil {
			return nil, err
		}

		// See https://dba.stackexchange.com/a/206811
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.StartDate.Unix()))).
			Where(
				sb.Or(
					sb.LessThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix())),
					sb.LessThan("UUID", uuid),
				),
			).OrderBy(orderForward)
	} else if pagination.At != nil && len(*pagination.At) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.At)
		if err != nil {
			return nil, err
		}
		sb.Where(sb.Equal("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(sb.Equal("UUID", uuid))
	} else if pagination.Before != nil && len(*pagination.Before) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.Before)
		if err != nil {
			return nil, err
		}

		sb.Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.EndDate.Unix()))).
			Where(
				sb.Or(
					sb.GreaterThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix())),
					sb.GreaterThan("UUID", uuid),
				),
			).
			OrderBy(orderBackward)
	} else {
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.EndDate.Unix()))).
			Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.StartDate.Unix())))

		if !pagination.CountOnly { // count queries can't be ordered because we don't include Timestamp in the select
			sb.OrderBy(orderForward)
		}
	}

	if filters.level != "" {
		if strings.Contains(filters.level, "%") {
			sb.Where(sb.Like("SeverityText", filters.level))
		} else {
			sb.Where(sb.Equal("SeverityText", filters.level))
		}
	}

	if filters.secure_session_id != "" {
		if strings.Contains(filters.secure_session_id, "%") {
			sb.Where(sb.Like("SecureSessionId", filters.secure_session_id))
		} else {
			sb.Where(sb.Equal("SecureSessionId", filters.secure_session_id))
		}
	}

	if filters.span_id != "" {
		if strings.Contains(filters.span_id, "%") {
			sb.Where(sb.Like("SpanId", filters.span_id))
		} else {
			sb.Where(sb.Equal("SpanId", filters.span_id))
		}
	}

	if filters.trace_id != "" {
		if strings.Contains(filters.trace_id, "%") {
			sb.Where(sb.Like("TraceId", filters.trace_id))
		} else {
			sb.Where(sb.Equal("TraceId", filters.trace_id))
		}
	}

	if filters.source != "" {
		if strings.Contains(filters.source, "%") {
			sb.Where(sb.Like("Source", filters.source))
		} else {
			sb.Where(sb.Equal("Source", filters.source))
		}
	}

	if filters.service_name != "" {
		if strings.Contains(filters.service_name, "%") {
			sb.Where(sb.Like("ServiceName", filters.service_name))
		} else {
			sb.Where(sb.Equal("ServiceName", filters.service_name))
		}
	}

	for key, value := range filters.attributes {
		if strings.Contains(value, "%") {
			sb.Where(
				sb.Var(sqlbuilder.Buildf("LogAttributes[%s] LIKE %s", key, value)),
			)
		} else {
			sb.Where(
				sb.Var(sqlbuilder.Buildf("LogAttributes[%s] = %s", key, value)),
			)
		}
	}

	return sb, nil
}

type filters struct {
	body              []string
	level             string
	trace_id          string
	span_id           string
	secure_session_id string
	source            string
	service_name      string
	attributes        map[string]string
}

func makeFilters(query string) filters {
	filters := filters{
		attributes: make(map[string]string),
	}

	queries := splitQuery(query)

	for _, q := range queries {
		parts := strings.Split(q, ":")

		if len(parts) == 1 && len(parts[0]) > 0 {
			body := parts[0]

			if strings.Contains(body, "*") {
				body = strings.ReplaceAll(body, "*", "%")
				filters.body = append(filters.body, body)
			} else {
				splitBody := strings.FieldsFunc(body, isSeparator)
				filters.body = append(filters.body, splitBody...)
			}
		} else if len(parts) == 2 {
			key, value := parts[0], parts[1]

			wildcardValue := strings.ReplaceAll(value, "*", "%")

			switch key {
			case modelInputs.ReservedLogKeyLevel.String():
				filters.level = wildcardValue
			case modelInputs.ReservedLogKeySecureSessionID.String():
				filters.secure_session_id = wildcardValue
			case modelInputs.ReservedLogKeySpanID.String():
				filters.span_id = wildcardValue
			case modelInputs.ReservedLogKeyTraceID.String():
				filters.trace_id = wildcardValue
			case modelInputs.ReservedLogKeySource.String():
				filters.source = wildcardValue
			case modelInputs.ReservedLogKeyServiceName.String():
				filters.service_name = wildcardValue
			default:
				filters.attributes[key] = wildcardValue
			}
		}
	}

	return filters
}

func isSeparator(r rune) bool {
	return !unicode.IsLetter(r) && !unicode.IsDigit(r)
}

// Splits the query by spaces _unless_ it is quoted
// "some thing" => ["some", "thing"]
// "some thing 'spaced string' else" => ["some", "thing", "spaced string", "else"]
func splitQuery(query string) []string {
	var result []string
	inquote := false
	i := 0
	for j, c := range query {
		if c == '"' {
			inquote = !inquote
		} else if c == ' ' && !inquote {
			result = append(result, unquoteAndTrim(query[i:j]))
			i = j + 1
		}
	}
	return append(result, unquoteAndTrim(query[i:]))
}

func unquoteAndTrim(s string) string {
	return strings.ReplaceAll(strings.Trim(s, " "), `"`, "")
}

func expandJSON(logAttributes map[string]string) map[string]interface{} {
	gqlLogAttributes := make(map[string]interface{}, len(logAttributes))
	for i, v := range logAttributes {
		gqlLogAttributes[i] = v
	}

	out, err := flat.Unflatten(gqlLogAttributes, nil)
	if err != nil {
		return gqlLogAttributes
	}

	return out
}

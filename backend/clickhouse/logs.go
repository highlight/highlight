package clickhouse

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/google/uuid"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/huandu/go-sqlbuilder"
	flat "github.com/nqd/flat"
	"github.com/samber/lo"
)

const LogsTable = "logs"

func (client *Client) BatchWriteLogRows(ctx context.Context, logRows []*LogRow) error {
	if len(logRows) == 0 {
		return nil
	}

	rows := lo.Map(logRows, func(l *LogRow, _ int) interface{} {
		if len(l.UUID) == 0 {
			l.UUID = uuid.New().String()
		}
		return l
	})
	ib := sqlbuilder.NewStruct(new(LogRow)).InsertInto(LogsTable, rows...)
	sql, args := ib.BuildWithFlavor(sqlbuilder.ClickHouse)

	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))
	return client.conn.Exec(chCtx, sql, args...)
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

func (client *Client) ReadLogs(ctx context.Context, projectID int, params modelInputs.LogsParamsInput, pagination Pagination) (*modelInputs.LogConnection, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}
	selectStr := "Timestamp, UUID, SeverityText, Body, LogAttributes, TraceId, SpanId, SecureSessionId, Source, ServiceName, ServiceVersion"

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
			ServiceVersion  string
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
				ServiceVersion:  &result.ServiceVersion,
			},
		})
	}
	rows.Close()

	span.Finish(tracer.WithError(rows.Err()))
	return getLogsConnection(edges, pagination), rows.Err()
}

// This is a lighter weight version of the previous function for loading the minimal about of data for a session
func (client *Client) ReadSessionLogs(ctx context.Context, projectID int, params modelInputs.LogsParamsInput) ([]*modelInputs.LogEdge, error) {
	selectStr := "Timestamp, UUID, SeverityText, Body"
	sb, err := makeSelectBuilder(selectStr, projectID, params, Pagination{}, OrderBackwardInverted, OrderForwardInverted)
	if err != nil {
		return nil, err
	}

	sql, args := sb.Build()

	span, _ := tracer.StartSpanFromContext(ctx, "logs", tracer.ResourceName("ReadSessionLogs"))
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
			Timestamp    time.Time
			UUID         string
			SeverityText string
			Body         string
		}
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		edges = append(edges, &modelInputs.LogEdge{
			Cursor: encodeCursor(result.Timestamp, result.UUID),
			Node: &modelInputs.Log{
				Timestamp: result.Timestamp,
				Level:     makeLogLevel(result.SeverityText),
				Message:   result.Body,
			},
		})
	}
	rows.Close()
	span.Finish(tracer.WithError(rows.Err()))
	return edges, rows.Err()
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

type number interface {
	uint64 | float64
}

func (client *Client) ReadLogsDailySum(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (uint64, error) {
	return readLogsDailyImpl[uint64](ctx, client, "sum", projectIds, dateRange)
}

func (client *Client) ReadLogsDailyAverage(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (float64, error) {
	return readLogsDailyImpl[float64](ctx, client, "avg", projectIds, dateRange)
}

func readLogsDailyImpl[N number](ctx context.Context, client *Client, aggFn string, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (N, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(fmt.Sprintf("COALESCE(%s(Count), 0) AS Count", aggFn)).
		From("log_count_daily_mv").
		Where(sb.In("ProjectId", projectIds)).
		Where(sb.LessThan("toUInt64(Day)", uint64(dateRange.EndDate.Unix()))).
		Where(sb.GreaterEqualThan("toUInt64(Day)", uint64(dateRange.StartDate.Unix())))

	sql, args := sb.Build()

	var out N
	err := client.conn.QueryRow(
		ctx,
		sql,
		args...,
	).Scan(&out)

	switch v := any(out).(type) {
	case float64:
		if math.IsNaN(v) {
			return 0, err
		}
	}

	return out, err
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

func (client *Client) LogsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time) ([]*modelInputs.LogKey, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("arrayJoin(LogAttributes.keys) as key, count() as cnt").
		From(LogsTable).
		Where(sb.Equal("ProjectId", projectID)).
		GroupBy("key").
		OrderBy("cnt DESC").
		Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(endDate.Unix()))).
		Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(startDate.Unix())))

	sql, args := sb.Build()

	span, _ := tracer.StartSpanFromContext(ctx, "logs", tracer.ResourceName("LogsKeys"))
	query, err := sqlbuilder.ClickHouse.Interpolate(sql, args)
	if err != nil {
		span.Finish(tracer.WithError(err))
		return nil, err
	}
	span.SetTag("Query", query)

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		return nil, err
	}

	keys := []*modelInputs.LogKey{}
	for rows.Next() {
		var (
			Key   string
			Count uint64
		)
		if err := rows.Scan(&Key, &Count); err != nil {
			return nil, err
		}

		keys = append(keys, &modelInputs.LogKey{
			Name: Key,
			Type: modelInputs.LogKeyTypeString, // For now, assume everything is a string
		})
	}

	for _, key := range modelInputs.AllReservedLogKey {
		keys = append(keys, &modelInputs.LogKey{
			Name: key.String(),
			Type: modelInputs.LogKeyTypeString,
		})
	}

	rows.Close()

	span.Finish(tracer.WithError(rows.Err()))
	return keys, rows.Err()

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
	case modelInputs.ReservedLogKeyServiceVersion.String():
		sb.Select("DISTINCT ServiceVersion service_version").
			From(LogsTable).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("service_version", "")).
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

	makeFilterConditions(sb, filters.level, "SeverityText")
	makeFilterConditions(sb, filters.secure_session_id, "SecureSessionId")
	makeFilterConditions(sb, filters.span_id, "SpanId")
	makeFilterConditions(sb, filters.trace_id, "TraceId")
	makeFilterConditions(sb, filters.source, "Source")
	makeFilterConditions(sb, filters.service_name, "ServiceName")
	makeFilterConditions(sb, filters.service_version, "ServiceVersion")

	conditions := []string{}
	for key, values := range filters.attributes {
		if len(values) == 1 {
			value := values[0]
			if strings.Contains(value, "%") {
				conditions = append(conditions, sb.Var(sqlbuilder.Buildf("LogAttributes[%s] LIKE %s", key, value)))
			} else {
				conditions = append(conditions, sb.Var(sqlbuilder.Buildf("LogAttributes[%s] = %s", key, value)))
			}
		} else {
			innerConditions := []string{}
			for _, value := range values {
				if strings.Contains(value, "%") {
					innerConditions = append(innerConditions, sb.Var(sqlbuilder.Buildf("LogAttributes[%s] LIKE %s", key, value)))
				} else {
					innerConditions = append(innerConditions, sb.Var(sqlbuilder.Buildf("LogAttributes[%s] = %s", key, value)))
				}
			}
			conditions = append(conditions, sb.Or(innerConditions...))
		}
	}
	if len(conditions) > 0 {
		sb.Where(sb.And(conditions...))
	}

	return sb, nil
}

type filtersWithReservedKeys struct {
	body              []string
	level             []string
	trace_id          []string
	span_id           []string
	secure_session_id []string
	source            []string
	service_name      []string
	service_version   []string
	attributes        map[string][]string
}

func makeFilters(query string) filtersWithReservedKeys {
	filters := queryparser.Parse(query)
	filtersWithReservedKeys := filtersWithReservedKeys{
		attributes: make(map[string][]string),
	}

	filtersWithReservedKeys.body = filters.Body

	if val, ok := filters.Attributes[modelInputs.ReservedLogKeyLevel.String()]; ok {
		filtersWithReservedKeys.level = val
		delete(filters.Attributes, modelInputs.ReservedLogKeyLevel.String())
	}

	if val, ok := filters.Attributes[modelInputs.ReservedLogKeyTraceID.String()]; ok {
		filtersWithReservedKeys.trace_id = val
		delete(filters.Attributes, modelInputs.ReservedLogKeyTraceID.String())
	}

	if val, ok := filters.Attributes[modelInputs.ReservedLogKeySpanID.String()]; ok {
		filtersWithReservedKeys.span_id = val
		delete(filters.Attributes, modelInputs.ReservedLogKeySpanID.String())
	}

	if val, ok := filters.Attributes[modelInputs.ReservedLogKeySecureSessionID.String()]; ok {
		filtersWithReservedKeys.secure_session_id = val
		delete(filters.Attributes, modelInputs.ReservedLogKeySecureSessionID.String())
	}

	if val, ok := filters.Attributes[modelInputs.ReservedLogKeySource.String()]; ok {
		filtersWithReservedKeys.source = val
		delete(filters.Attributes, modelInputs.ReservedLogKeySource.String())
	}

	if val, ok := filters.Attributes[modelInputs.ReservedLogKeyServiceName.String()]; ok {
		filtersWithReservedKeys.service_name = val
		delete(filters.Attributes, modelInputs.ReservedLogKeyServiceName.String())
	}

	if val, ok := filters.Attributes[modelInputs.ReservedLogKeyServiceVersion.String()]; ok {
		filtersWithReservedKeys.service_version = val
		delete(filters.Attributes, modelInputs.ReservedLogKeyServiceVersion.String())
	}

	filtersWithReservedKeys.attributes = filters.Attributes

	return filtersWithReservedKeys
}

func makeFilterConditions(sb *sqlbuilder.SelectBuilder, filters []string, column string) {
	conditions := []string{}
	for _, filter := range filters {
		if strings.Contains(filter, "%") {
			conditions = append(conditions, sb.Like(column, filter))
		} else {
			conditions = append(conditions, sb.Equal(column, filter))
		}
	}

	if len(conditions) > 0 {
		sb.Where(sb.Or(conditions...))
	}
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

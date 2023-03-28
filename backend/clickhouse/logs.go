package clickhouse

import (
	"context"
	"fmt"
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

const OrderBackward = "Timestamp ASC, UUID ASC"
const OrderForward = "Timestamp DESC, UUID DESC"

type Pagination struct {
	After     *string
	Before    *string
	At        *string
	CountOnly bool
}

func (client *Client) ReadLogs(ctx context.Context, projectID int, params modelInputs.LogsParamsInput, pagination Pagination) (*modelInputs.LogsConnection, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}
	selectStr := "Timestamp, UUID, SeverityText, Body, LogAttributes, TraceId, SpanId, SecureSessionId, Source, ServiceName"

	if pagination.At != nil && len(*pagination.At) > 1 {
		// Create a "window" around the cursor
		// https://stackoverflow.com/a/71738696
		beforeSb, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			Before: pagination.At,
		})
		if err != nil {
			return nil, err
		}
		beforeSb.Limit(LogsLimit/2 + 1)

		atSb, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			At: pagination.At,
		})
		if err != nil {
			return nil, err
		}

		afterSb, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			After: pagination.At,
		})
		if err != nil {
			return nil, err
		}
		afterSb.Limit(LogsLimit/2 + 1)

		ub := sqlbuilder.UnionAll(beforeSb, atSb, afterSb)
		sb.Select(selectStr).From(sb.BuilderAs(ub, "logs_window")).OrderBy(OrderForward)
	} else {
		fromSb, err := makeSelectBuilder(selectStr, projectID, params, pagination)
		if err != nil {
			return nil, err
		}

		fromSb.Limit(LogsLimit + 1)
		sb.Select(selectStr).From(sb.BuilderAs(fromSb, "logs_window")).OrderBy(OrderForward)
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
	sb, err := makeSelectBuilder("COUNT(*)", projectID, params, Pagination{CountOnly: true})
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

func makeSelectBuilder(selectStr string, projectID int, params modelInputs.LogsParamsInput, pagination Pagination) (*sqlbuilder.SelectBuilder, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(selectStr).
		From(LogsTable).
		Where(sb.Equal("ProjectId", projectID))

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
			).OrderBy(OrderForward)
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
			OrderBy(OrderBackward)
	} else {
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.EndDate.Unix()))).
			Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.StartDate.Unix())))

		if !pagination.CountOnly { // count queries can't be ordered because we don't include Timestamp in the select
			sb.OrderBy(OrderForward)
		}

	}

	filters := makeFilters(params.Query)

	for _, body := range filters.body {
		if strings.Contains(body, "%") {
			sb.Where("Body ILIKE" + sb.Var(body))
		} else {
			sb.Where("hasTokenCaseInsensitive(Body, " + sb.Var(body) + ")")
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
		column := fmt.Sprintf("LogAttributes['%s']", key)
		if strings.Contains(value, "%") {
			sb.Where(sb.Like(column, value))
		} else {
			sb.Where(sb.Equal(column, value))
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

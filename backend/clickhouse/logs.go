package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/google/uuid"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	flat "github.com/nqd/flat"
	e "github.com/pkg/errors"
)

type LogRowPrimaryAttrs struct {
	Timestamp       time.Time
	ProjectId       uint32
	TraceId         string
	SpanId          string
	SecureSessionId string
}

type LogRow struct {
	LogRowPrimaryAttrs
	UUID           string
	TraceFlags     uint32
	SeverityText   string
	SeverityNumber int32
	ServiceName    string
	Body           string
	LogAttributes  map[string]string
}

func NewLogRow(attrs LogRowPrimaryAttrs) *LogRow {
	return &LogRow{
		LogRowPrimaryAttrs: LogRowPrimaryAttrs{
			Timestamp:       attrs.Timestamp,
			TraceId:         attrs.TraceId,
			SpanId:          attrs.SpanId,
			ProjectId:       attrs.ProjectId,
			SecureSessionId: attrs.SecureSessionId,
		},
		UUID:           uuid.New().String(),
		SeverityText:   "INFO",
		SeverityNumber: int32(log.InfoLevel),
	}
}

func (l *LogRow) Cursor() string {
	return encodeCursor(l.Timestamp, l.UUID)
}

func (client *Client) BatchWriteLogRows(ctx context.Context, logRows []*LogRow) error {
	batch, err := client.conn.PrepareBatch(ctx, "INSERT INTO logs")

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

type Pagination struct {
	After          *string
	AfterOrEqualTo *string // currently only used internally
	Before         *string
	At             *string
}

func (client *Client) ReadLogs(ctx context.Context, projectID int, params modelInputs.LogsParamsInput, pagination Pagination) (*modelInputs.LogsConnection, error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}
	selectStr := "Timestamp, UUID, SeverityText, Body, LogAttributes"
	orderBy := "Timestamp DESC, UUID DESC"

	if pagination.At != nil && len(*pagination.At) > 1 {
		// Create a "window" around the cursor
		// https://stackoverflow.com/a/71738696
		sb1, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			Before: pagination.At,
		})
		if err != nil {
			return nil, err
		}
		sb1.OrderBy("Timestamp ASC, UUID ASC").Limit(LogsLimit/2 + 1)

		sb2, err := makeSelectBuilder(selectStr, projectID, params, Pagination{
			AfterOrEqualTo: pagination.At,
		})
		if err != nil {
			return nil, err
		}
		sb2.OrderBy(orderBy).Limit(LogsLimit/2 + 2)

		ub := sqlbuilder.UnionAll(sb1, sb2)
		sb.Select(selectStr).From(sb.BuilderAs(ub, "logs_window")).OrderBy(orderBy)
	} else {
		sb, err = makeSelectBuilder(selectStr, projectID, params, pagination)
		if err != nil {
			return nil, err
		}

		sb.OrderBy(orderBy).Limit(LogsLimit + 1)
	}

	sql, args := sb.Build()

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
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
		}
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		edges = append(edges, &modelInputs.LogEdge{
			Cursor: encodeCursor(result.Timestamp, result.UUID),
			Node: &modelInputs.Log{
				Timestamp:       result.Timestamp,
				SeverityText:    makeSeverityText(result.SeverityText),
				Body:            result.Body,
				LogAttributes:   expandJSON(result.LogAttributes),
				TraceID:         &result.TraceId,
				SpanID:          &result.SpanId,
				SecureSessionID: &result.SecureSessionId,
			},
		})
	}
	rows.Close()

	return getLogsConnection(edges, pagination), rows.Err()
}

func (client *Client) ReadLogsTotalCount(ctx context.Context, projectID int, params modelInputs.LogsParamsInput) (uint64, error) {
	sb, err := makeSelectBuilder("COUNT(*)", projectID, params, Pagination{})
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

func (client *Client) ReadLogsHistogram(ctx context.Context, projectID int, params modelInputs.LogsParamsInput, nBuckets int) ([]uint64, error) {
	startTimestamp := uint64(params.DateRange.StartDate.Unix())
	endTimestamp := uint64(params.DateRange.EndDate.Unix())

	fromSb, err := makeSelectBuilder(
		fmt.Sprintf(
			"toUInt64(floor(%d * (toUInt64(Timestamp) - %d) / (%d - %d))) AS bucket",
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
		Select("bucket, count()").
		From(sb.BuilderAs(fromSb, "logs")).
		GroupBy("bucket").
		OrderBy("bucket")

	sql, args := sb.Build()

	counts := make([]uint64, nBuckets)
	rows, err := client.conn.Query(
		ctx,
		sql,
		args...,
	)

	if err != nil {
		return nil, err
	}

	var (
		bucket uint64
		count  uint64
	)
	for rows.Next() {
		if err := rows.Scan(&bucket, &count); err != nil {
			return nil, err
		}
		// clamp bucket to [0, nBuckets)
		if bucket >= uint64(nBuckets) {
			bucket = uint64(nBuckets - 1)
		}

		counts[bucket] = count
	}

	return counts, err
}

func (client *Client) LogsKeys(ctx context.Context, projectID int) ([]*modelInputs.LogKey, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("arrayJoin(LogAttributes.keys) as key, count() as cnt").
		From("logs").
		Where(sb.Equal("ProjectId", projectID)).
		GroupBy("key").
		OrderBy("cnt DESC").
		Limit(50)

	sql, args := sb.Build()

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
	return keys, rows.Err()

}

func (client *Client) LogsKeyValues(ctx context.Context, projectID int, keyName string) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()

	switch keyName {
	case modelInputs.ReservedLogKeyLevel.String():
		sb.Select("SeverityText level, count() as cnt").
			From("logs").
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("level", "")).
			GroupBy("level").
			OrderBy("cnt DESC").
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeySecureSessionID.String():
		sb.Select("SecureSessionId secure_session_id, count() as cnt").
			From("logs").
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("secure_session_id", "")).
			GroupBy("secure_session_id").
			OrderBy("cnt DESC").
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeySpanID.String():
		sb.Select("SpanId span_id, count() as cnt").
			From("logs").
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("span_id", "")).
			GroupBy("span_id").
			OrderBy("cnt DESC").
			Limit(KeyValuesLimit)
	case modelInputs.ReservedLogKeyTraceID.String():
		sb.Select("TraceId trace_id, count() as cnt").
			From("logs").
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("trace_id", "")).
			GroupBy("trace_id").
			OrderBy("cnt DESC").
			Limit(KeyValuesLimit)
	default:
		sb.Select("LogAttributes [" + sb.Var(keyName) + "] as value, count() as cnt").
			From("logs").
			Where(sb.Equal("ProjectId", projectID)).
			Where("mapContains(LogAttributes, " + sb.Var(keyName) + ")").
			GroupBy("value").
			OrderBy("cnt DESC").
			Limit(KeyValuesLimit)
	}

	sql, args := sb.Build()

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		return nil, err
	}

	values := []string{}
	for rows.Next() {
		var (
			Value string
			Count uint64
		)
		if err := rows.Scan(&Value, &Count); err != nil {
			return nil, err
		}

		values = append(values, Value)
	}

	rows.Close()

	return values, rows.Err()
}

func makeSeverityText(severityText string) modelInputs.SeverityText {
	switch strings.ToLower(severityText) {
	case "trace":
		{
			return modelInputs.SeverityTextTrace

		}
	case "debug":
		{
			return modelInputs.SeverityTextDebug

		}
	case "info":
		{
			return modelInputs.SeverityTextInfo

		}
	case "warn":
		{
			return modelInputs.SeverityTextWarn
		}
	case "error":
		{
			return modelInputs.SeverityTextError
		}

	case "fatal":
		{
			return modelInputs.SeverityTextFatal
		}

	default:
		return modelInputs.SeverityTextInfo
	}
}

func makeSelectBuilder(selectStr string, projectID int, params modelInputs.LogsParamsInput, pagination Pagination) (*sqlbuilder.SelectBuilder, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(selectStr).
		From("logs").
		Where(sb.Equal("ProjectId", projectID))

	if pagination.After != nil && len(*pagination.After) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.After)
		if err != nil {
			return nil, err
		}

		// See https://dba.stackexchange.com/a/206811
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(
				sb.Or(
					sb.LessThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix())),
					sb.LessThan("UUID", uuid),
				),
			)
	} else if pagination.AfterOrEqualTo != nil && len(*pagination.AfterOrEqualTo) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.AfterOrEqualTo)
		if err != nil {
			return nil, err
		}
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(
				sb.Or(
					sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix())),
					sb.LessEqualThan("UUID", uuid),
				),
			)
	} else if pagination.Before != nil && len(*pagination.Before) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.Before)
		if err != nil {
			return nil, err
		}

		sb.Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(
				sb.Or(
					sb.GreaterThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix())),
					sb.GreaterThan("UUID", uuid),
				),
			)
	} else {
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.EndDate.Unix()))).
			Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.StartDate.Unix())))
	}

	filters := makeFilters(params.Query)

	if len(filters.body) > 0 {
		sb.Where("Body ILIKE" + sb.Var(filters.body))
	}

	if len(filters.level) > 0 {
		if strings.Contains(filters.level, "%") {
			sb.Where(sb.Like("SeverityText", filters.level))
		} else {
			sb.Where(sb.Equal("SeverityText", filters.level))
		}
	}

	if len(filters.secure_session_id) > 0 {
		if strings.Contains(filters.secure_session_id, "%") {
			sb.Where(sb.Like("SecureSessionId", filters.secure_session_id))
		} else {
			sb.Where(sb.Equal("SecureSessionId", filters.secure_session_id))
		}
	}

	if len(filters.span_id) > 0 {
		if strings.Contains(filters.span_id, "%") {
			sb.Where(sb.Like("SpanId", filters.span_id))
		} else {
			sb.Where(sb.Equal("SpanId", filters.span_id))
		}
	}

	if len(filters.trace_id) > 0 {
		if strings.Contains(filters.trace_id, "%") {
			sb.Where(sb.Like("TraceId", filters.trace_id))
		} else {
			sb.Where(sb.Equal("TraceId", filters.trace_id))
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
	body              string
	level             string
	trace_id          string
	span_id           string
	secure_session_id string
	attributes        map[string]string
}

func makeFilters(query string) filters {
	filters := filters{
		body:       "",
		attributes: make(map[string]string),
	}

	queries := splitQuery(query)

	for _, q := range queries {
		parts := strings.Split(q, ":")

		if len(parts) == 1 && len(parts[0]) > 0 {
			body := parts[0]
			if strings.Contains(body, "*") {
				body = strings.ReplaceAll(body, "*", "%")
			}
			filters.body = filters.body + body
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
			default:
				filters.attributes[key] = wildcardValue
			}
		}
	}

	if len(filters.body) > 0 && !strings.Contains(filters.body, "%") {
		filters.body = "%" + filters.body + "%"
	}

	return filters
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

package clickhouse

import (
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"
	"strings"
	"time"

	sq "github.com/Masterminds/squirrel"
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

const Limit uint64 = 100

func (client *Client) ReadLogs(ctx context.Context, projectID int, params modelInputs.LogsParamsInput, after *string) (*modelInputs.LogsPayload, error) {
	query := makeSelectQuery("Timestamp, UUID, SeverityText, Body, LogAttributes", projectID, params, after)
	query = query.OrderBy("Timestamp DESC, UUID DESC").Limit(Limit + 1)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := client.conn.Query(
		ctx,
		sql,
		args...,
	)

	if err != nil {
		return nil, err
	}

	logs := []*modelInputs.LogEdge{}

	for rows.Next() {
		var (
			Timestamp     time.Time
			UUID          string
			SeverityText  string
			Body          string
			LogAttributes map[string]string
		)
		if err := rows.Scan(&Timestamp, &UUID, &SeverityText, &Body, &LogAttributes); err != nil {
			return nil, err
		}

		logs = append(logs, &modelInputs.LogEdge{
			Cursor: encodeCursor(Timestamp, UUID),
			Node: &modelInputs.Log{
				Timestamp:     Timestamp,
				SeverityText:  makeSeverityText(SeverityText),
				Body:          Body,
				LogAttributes: expandJSON(LogAttributes),
			},
		})
	}
	rows.Close()

	return getLogsPayload(logs, Limit), rows.Err()
}

func (client *Client) ReadLogsTotalCount(ctx context.Context, projectID int, params modelInputs.LogsParamsInput) (uint64, error) {
	query := makeSelectQuery("COUNT(*)", projectID, params, nil)
	sql, args, err := query.ToSql()
	if err != nil {
		return 0, err
	}

	var count uint64
	err = client.conn.QueryRow(
		ctx,
		sql,
		args...,
	).Scan(&count)

	return count, err
}

func (client *Client) LogsKeys(ctx context.Context, projectID int) ([]*modelInputs.LogKey, error) {
	query := sq.Select("arrayJoin(LogAttributes.keys) as key, count() as cnt").
		From("logs").
		Where(sq.Eq{"ProjectId": projectID}).
		GroupBy("key").
		OrderBy("cnt DESC").
		Limit(50)

	sql, args, err := query.ToSql()

	if err != nil {
		return nil, err
	}

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

	keys = append(keys, &modelInputs.LogKey{
		Name: "level",
		Type: modelInputs.LogKeyTypeString,
	})

	rows.Close()
	return keys, rows.Err()

}

func (client *Client) LogsKeyValues(ctx context.Context, projectID int, keyName string) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()

	// TODO(et) - this is going to be a mess when we add other reserved keys like Trace. Clean this up when that happens.
	if keyName == "level" {
		sb.Select("SeverityText level, count() as cnt").
			From("logs").
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("level", "")).
			GroupBy("level").
			OrderBy("cnt DESC").
			Limit(50)
	} else {
		sb.Select("LogAttributes [" + sb.Var(keyName) + "] as value, count() as cnt").
			From("logs").
			Where(sb.Equal("ProjectId", projectID)).
			Where("mapContains(LogAttributes, " + sb.Var(keyName) + ")").
			GroupBy("value").
			OrderBy("cnt DESC").
			Limit(50)
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

func makeSelectQuery(selectStr string, projectID int, params modelInputs.LogsParamsInput, after *string) sq.SelectBuilder {
	query := sq.Select(selectStr).
		From("logs").
		Where(sq.Eq{"ProjectId": projectID})

	if after != nil && len(*after) > 1 {
		timestamp, uuid, err := decodeCursor(*after)
		if err != nil {
			fmt.Print("error decoding cursor")
		}

		// See https://dba.stackexchange.com/a/206811
		query = query.Where("toUInt64(toDateTime(Timestamp)) <= ?", uint64(timestamp.Unix())).
			Where("(toUInt64(toDateTime(Timestamp)) < ? OR UUID < ?)", uint64(timestamp.Unix()), uuid)

	} else {
		query = query.Where(sq.LtOrEq{"toUInt64(toDateTime(Timestamp))": uint64(params.DateRange.EndDate.Unix())}).
			Where(sq.GtOrEq{"toUInt64(toDateTime(Timestamp))": uint64(params.DateRange.StartDate.Unix())})
	}

	filters := makeFilters(params.Query)

	if len(filters.body) > 0 {
		query = query.Where(sq.ILike{"Body": filters.body})
	}

	if len(filters.level) > 0 {
		if strings.Contains(filters.level, "%") {
			query = query.Where(sq.Eq{"SeverityText": filters.level})

		} else {
			query = query.Where(sq.Eq{"SeverityText": filters.level})
		}
	}

	for key, value := range filters.attributes {
		column := fmt.Sprintf("LogAttributes['%s']", key)
		if strings.Contains(value, "%") {
			query = query.Where(sq.Like{column: value})

		} else {
			query = query.Where(sq.Eq{column: value})
		}
	}

	return query
}

type filters struct {
	body       string
	level      string
	attributes map[string]string
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

			if key == "level" {
				filters.level = value
			} else {
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

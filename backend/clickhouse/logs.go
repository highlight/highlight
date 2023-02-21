package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	sq "github.com/Masterminds/squirrel"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	e "github.com/pkg/errors"
)

type LogRow struct {
	Timestamp          time.Time
	TraceId            string
	SpanId             string
	TraceFlags         uint32
	SeverityText       string
	SeverityNumber     int32
	ServiceName        string
	Body               string
	ResourceAttributes map[string]string
	LogAttributes      map[string]string
	ProjectId          uint32
	SecureSessionId    string
}

func (client *Client) BatchWriteLogRows(ctx context.Context, logRows []*LogRow) error {
	batch, err := client.conn.PrepareBatch(ctx, "INSERT INTO logs")

	if err != nil {
		return e.Wrap(err, "failed to create logs batch")
	}

	for _, logRow := range logRows {
		err = batch.AppendStruct(logRow)
		if err != nil {
			return err
		}
	}
	return batch.Send()
}

func (client *Client) ReadLogs(ctx context.Context, projectID int, params modelInputs.LogsParamsInput) ([]*modelInputs.LogLine, error) {
	query := makeSelectQuery("Timestamp, SeverityText, Body, LogAttributes", projectID, params)
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

	logLines := []*modelInputs.LogLine{}

	for rows.Next() {
		var (
			Timestamp     time.Time
			SeverityText  string
			Body          string
			LogAttributes map[string]string
		)
		if err := rows.Scan(&Timestamp, &SeverityText, &Body, &LogAttributes); err != nil {
			return nil, err
		}

		gqlLogAttributes := make(map[string]interface{}, len(LogAttributes))
		for i, v := range LogAttributes {
			gqlLogAttributes[i] = v
		}

		logLines = append(logLines, &modelInputs.LogLine{
			Timestamp:     Timestamp,
			SeverityText:  makeSeverityText(SeverityText),
			Body:          Body,
			LogAttributes: gqlLogAttributes,
		})
	}
	rows.Close()
	return logLines, rows.Err()
}

func (client *Client) ReadLogsTotalCount(ctx context.Context, projectID int, params modelInputs.LogsParamsInput) (uint64, error) {
	query := makeSelectQuery("COUNT(*)", projectID, params)
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
	now := time.Now()
	query := sq.Select("arrayJoin(LogAttributes.keys) as key, count() as cnt").
		From("logs").
		Where(sq.Eq{"ProjectId": projectID}).
		Where(sq.LtOrEq{"Timestamp": now}).
		Where(sq.GtOrEq{"Timestamp": now.AddDate(0, 0, -30)}).
		GroupBy("key").
		OrderBy("cnt DESC")

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

	rows.Close()
	return keys, rows.Err()

}

func (client *Client) LogsKeyValues(ctx context.Context, projectID int, keyName string) ([]string, error) {
	rows, err := client.conn.Query(ctx,
		`
		SELECT LogAttributes[?] as value, count() as cnt FROM logs
		WHERE ProjectId = ?
		GROUP BY value
		ORDER BY cnt DESC
		LIMIT 50;`,
		keyName,
		projectID,
	)

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

func makeSelectQuery(selectStr string, projectID int, params modelInputs.LogsParamsInput) sq.SelectBuilder {
	query := sq.Select(selectStr).
		From("logs").
		Where(sq.Eq{"ProjectId": projectID}).
		Where(sq.LtOrEq{"toUInt64(toDateTime(Timestamp))": uint64(params.DateRange.EndDate.Unix())}).
		Where(sq.GtOrEq{"toUInt64(toDateTime(Timestamp))": uint64(params.DateRange.StartDate.Unix())})

	filters := makeFilters(params.Query)

	if len(filters.body) > 0 {
		query = query.Where(sq.ILike{"Body": filters.body})
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
	attributes map[string]string
}

func makeFilters(query string) filters {
	filters := filters{
		body:       "",
		attributes: make(map[string]string),
	}

	queries := split(query)

	for _, query := range queries {
		parts := strings.Split(query, ":")

		if len(parts) == 1 && len(parts[0]) > 0 {
			body := parts[0]
			if strings.Contains(body, "*") {
				body = strings.ReplaceAll(body, "*", "%")
			}
			filters.body = filters.body + body
		} else if len(parts) == 2 {
			wildcardValue := strings.ReplaceAll(parts[1], "*", "%")
			filters.attributes[parts[0]] = wildcardValue
		}
	}

	if len(filters.body) > 0 && !strings.Contains(filters.body, "%") {
		filters.body = "%" + filters.body + "%"
	}

	return filters
}

func split(s string) []string {
	var result []string
	inquote := false
	i := 0
	for j, c := range s {
		if c == '\'' {
			inquote = !inquote
		} else if c == ' ' && !inquote {
			result = append(result, unquoteAndTrim(s[i:j]))
			i = j + i
		}
	}
	return append(result, unquoteAndTrim(s[i:]))
}

func unquoteAndTrim(s string) string {
	return strings.ReplaceAll(strings.Trim(s, " "), "'", "")
}

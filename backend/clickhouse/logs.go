package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
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

const LogsTable = "logs"

func (client *Client) BatchWriteLogRows(ctx context.Context, logRows []*LogRow) error {
	query := fmt.Sprintf(`
		INSERT INTO %s
	`, LogsTable)

	batch, err := client.conn.PrepareBatch(ctx, query)

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
	whereClause := buildWhereClause(projectID, params)

	query := fmt.Sprintf(`
		SELECT Timestamp, SeverityText, Body, LogAttributes FROM %s
		%s
		LIMIT 100
	`, LogsTable, whereClause)

	log.Info(query)

	rows, err := client.conn.Query(
		ctx,
		query,
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

package clickhouse

import (
	"context"
	"fmt"
	"time"

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

const LogsTable = "logs"

func (client *Client) BatchWriteLogRows(ctx context.Context, logRows []*LogRow) error {
	query := fmt.Sprintf(`
		INSERT INTO %s
	`, LogsTable)

	batch, err := client.Conn.PrepareBatch(ctx, query)

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

func (client *Client) ReadLogs(ctx context.Context, projectID int) ([]*modelInputs.LogLine, error) {
	query := fmt.Sprintf(`
		SELECT Timestamp, SeverityText, Body FROM %s
		WHERE ProjectId = %d
		LIMIT 100
	`, LogsTable, projectID)

	rows, err := client.Conn.Query(
		ctx,
		query,
	)
	if err != nil {
		return nil, err
	}

	logLines := []*modelInputs.LogLine{}

	for rows.Next() {
		var (
			Timestamp    time.Time
			SeverityText string
			Body         string
		)
		if err := rows.Scan(&Timestamp, &SeverityText, &Body); err != nil {
			return nil, err
		}
		logLines = append(logLines, &modelInputs.LogLine{
			Timestamp:    Timestamp,
			SeverityText: SeverityText,
			Body:         Body,
		})
	}
	rows.Close()
	return logLines, rows.Err()
}

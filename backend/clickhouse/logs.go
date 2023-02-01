package clickhouse

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type LogRow struct {
	Timestamp       time.Time
	SeverityText    string
	Body            string
	ProjectId       uint32
	SecureSessionID string
}

const LogsTable = "logs"

// func (client *Client) CreateLogsTable(ctx context.Context) error {
// 	client.conn.Exec(ctx, "DROP TABLE IF EXISTS logs") //nolint:errcheck

// 	return client.conn.Exec(ctx, `
// 	CREATE TABLE IF NOT EXISTS logs (
// 		Timestamp       DateTime64(9) CODEC (Delta, ZSTD(1)),
// 		SeverityText    LowCardinality(String) CODEC (ZSTD(1)),
// 		Body            String CODEC (ZSTD(1)),
// 		ProjectId 		UInt32 CODEC (ZSTD(1)),
// 		SecureSessionID Nullable(String) CODEC (ZSTD(1))
// 	)
// 	ENGINE = MergeTree()
// 		PARTITION BY toDate(Timestamp)
// 		ORDER BY (ProjectId, toUnixTimestamp(Timestamp))
// 		TTL toDateTime(Timestamp) + toIntervalDay(30)
// 		SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
// 	`)
// }

type Message struct {
	Type  string `json:"type"`
	Trace []struct {
		ColumnNumber int    `json:"columnNumber"`
		LineNumber   int    `json:"lineNumber"`
		FileName     string `json:"fileName"`
		FunctionName string `json:"functionName,omitempty"`
		Source       string `json:"source"`
	} `json:"trace"`
	Value []string `json:"value"`
	Time  int64    `json:"time"`
}

type Messages struct {
	Messages []Message `json:"messages"`
}

func ParseConsoleMessages(projectID int, sessionSecureID string, messages string) ([]*LogRow, error) {
	messagesParsed := Messages{}
	if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
		return nil, e.Wrap(err, "error decoding message data")
	}

	var logRows []*LogRow
	for _, message := range messagesParsed.Messages {
		logRow, err := makeLogRow(projectID, sessionSecureID, message)
		if err != nil {
			// If there's an issue with parsing, we'll log for investigation and try the next one
			log.WithError(err).Error("failed to parse log message")
			continue
		}
		logRows = append(logRows, logRow)
	}
	return logRows, nil
}

func (client *Client) BatchWriteMessagesForSession(ctx context.Context, projectID int, sessionSecureID string, messages string) error {
	messagesParsed, err := ParseConsoleMessages(projectID, sessionSecureID, messages)
	if err != nil {
		return e.Wrap(err, "error decoding message data")
	}
	return client.BatchWriteLogRows(ctx, messagesParsed)
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

func (client *Client) ReadLogs(ctx context.Context, projectID int) ([]*modelInputs.LogLine, error) {
	query := fmt.Sprintf(`
		SELECT Timestamp, SeverityText, Body FROM %s
		WHERE ProjectId = %d
		LIMIT 100
	`, LogsTable, projectID)

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

func makeLogRow(projectID int, sessionSecureID string, message Message) (*LogRow, error) {
	if len(message.Value) != 2 {
		// message.Value looks like this:
		// message.Value[0] = "\[12342356]\""
		// message.Value[1] = "\Some log message\""
		// We can fetch the timestamp from message.Timestamp but we need to use message.Value[1] to fetch the original log message
		return nil, e.New("log row does not have a timestamp and a message")
	}

	unquotedMessage, err := strconv.Unquote(message.Value[1])
	if err != nil {
		return nil, e.Wrap(err, "failed to unquote message")
	}

	timestamp := time.UnixMilli(message.Time)

	return &LogRow{
		Timestamp:       timestamp,
		SeverityText:    message.Type,
		Body:            unquotedMessage,
		ProjectId:       uint32(projectID),
		SecureSessionID: sessionSecureID,
	}, nil
}

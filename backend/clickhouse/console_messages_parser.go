package clickhouse

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

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

func makeLogRow(projectID int, sessionSecureID string, message Message) (*LogRow, error) {

	// Try unquoting data from console.log
	var messageValue []string
	for _, v := range message.Value {
		unquotedMessage, err := strconv.Unquote(v)
		if err != nil {
			messageValue = append(messageValue, v)
		} else {
			messageValue = append(messageValue, unquotedMessage)
		}
	}

	traceId, _ := uuid.NewRandom()

	return &LogRow{
		Timestamp:       time.UnixMilli(message.Time),
		SeverityText:    message.Type,
		Body:            strings.Join(messageValue, " "),
		ProjectId:       uint32(projectID),
		SecureSessionId: sessionSecureID,
		TraceId:         traceId.String(),
	}, nil
}

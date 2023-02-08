package hlog

import (
	"context"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

var (
	LogName        = "log"
	LogSeverityKey = attribute.Key("log.severity")
	LogMessageKey  = attribute.Key("log.message")
)

func SubmitFrontendConsoleMessages(projectID int, sessionSecureID string, messages string) error {
	logRows, err := clickhouse.ParseConsoleMessages(projectID, sessionSecureID, messages)
	if err != nil {
		return err
	}

	if len(logRows) == 0 {
		return nil
	}

	span, _ := highlight.StartTrace(context.TODO(), "highlight-ctx", attribute.String("Source", "SubmitFrontendConsoleMessages"))
	defer highlight.EndTrace(span)

	for _, row := range logRows {
		attrs := []attribute.KeyValue{
			LogSeverityKey.String(row.SeverityText),
			LogMessageKey.String(row.Body),
		}
		for k, v := range row.LogAttributes {
			attrs = append(attrs, attribute.String(k, v))
		}

		span.AddEvent(LogName, trace.WithAttributes(attrs...))
		if row.SeverityNumber <= int32(codes.Error) {
			span.SetStatus(codes.Error, row.Body)
		}
	}

	return nil
}

package hlog

import (
	"context"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
	"strconv"
	"strings"
	"time"
)

var (
	LogName        = "log"
	LogSeverityKey = attribute.Key("log.severity")
	LogMessageKey  = attribute.Key("log.message")
)

func SubmitFrontendConsoleMessages(projectID int, sessionSecureID string, messages string) error {
	logRows, err := ParseConsoleMessages(messages)
	if err != nil {
		return err
	}

	if len(logRows) == 0 {
		return nil
	}

	span, _ := highlight.StartTrace(
		context.TODO(), "highlight-ctx",
		attribute.String("Source", "SubmitFrontendConsoleMessages"),
		attribute.String(highlight.ProjectIDAttribute, strconv.Itoa(projectID)),
		attribute.String(highlight.SessionIDAttribute, sessionSecureID),
	)
	defer highlight.EndTrace(span)

	for _, row := range logRows {
		message := strings.Join(row.Value, " ")
		attrs := []attribute.KeyValue{
			LogSeverityKey.String(row.Type),
			LogMessageKey.String(message),
		}
		if len(row.Trace) > 0 {
			traceEnd := &row.Trace[len(row.Trace)-1]
			attrs = append(
				attrs,
				semconv.CodeFunctionKey.String(traceEnd.FunctionName),
				semconv.CodeNamespaceKey.String(traceEnd.Source),
				semconv.CodeFilepathKey.String(traceEnd.FileName),
				semconv.CodeLineNumberKey.Int(traceEnd.LineNumber),
				semconv.CodeColumnKey.Int(traceEnd.ColumnNumber),
			)
		}

		span.AddEvent(LogName, trace.WithAttributes(attrs...), trace.WithTimestamp(time.UnixMilli(row.Time)))
		if row.Type == "error" {
			span.SetStatus(codes.Error, message)
		}
	}

	return nil
}

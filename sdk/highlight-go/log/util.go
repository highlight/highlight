package hlog

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
)

type VercelProxy struct {
	Timestamp   int64    `json:"timestamp"`
	Method      string   `json:"method"`
	Scheme      string   `json:"scheme"`
	Host        string   `json:"host"`
	Path        string   `json:"path"`
	UserAgent   []string `json:"userAgent"`
	Referer     string   `json:"referer"`
	StatusCode  int64    `json:"statusCode"`
	ClientIp    string   `json:"clientIp"`
	Region      string   `json:"region"`
	CacheId     string   `json:"cacheId"`
	VercelCache string   `json:"vercelCache"`
}

type VercelLog struct {
	Id           string `json:"id"`
	Message      string `json:"message"`
	Timestamp    int64  `json:"timestamp"`
	Source       string `json:"source"`
	ProjectId    string `json:"projectId"`
	DeploymentId string `json:"deploymentId"`
	BuildId      string `json:"buildId"`
	Host         string `json:"host"`

	Type       string `json:"type"`
	Entrypoint string `json:"entrypoint"`

	RequestId   string      `json:"requestId"`
	StatusCode  int64       `json:"statusCode"`
	Destination string      `json:"destination"`
	Path        string      `json:"path"`
	Proxy       VercelProxy `json:"proxy"`
}

func SubmitFrontendConsoleMessages(ctx context.Context, projectID int, sessionSecureID string, messages string) error {
	logRows, err := ParseConsoleMessages(messages)
	if err != nil {
		return err
	}

	if len(logRows) == 0 {
		return nil
	}

	for _, row := range logRows {
		span, _ := highlight.StartTrace(
			ctx, "highlight-ctx",
			attribute.String(highlight.SourceAttribute, modelInputs.LogSourceFrontend.String()),
			attribute.String(highlight.ProjectIDAttribute, strconv.Itoa(projectID)),
			attribute.String(highlight.SessionIDAttribute, sessionSecureID),
		)
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
			)

			var ln int
			if x, ok := traceEnd.LineNumber.(int); ok {
				ln = x
			} else if x, ok := traceEnd.LineNumber.(string); ok {
				if i, err := strconv.ParseInt(x, 10, 32); err == nil {
					ln = int(i)
				}
			}
			if ln != 0 {
				attrs = append(attrs, semconv.CodeLineNumberKey.Int(ln))
			}

			var cn int
			if x, ok := traceEnd.ColumnNumber.(int); ok {
				cn = x
			} else if x, ok := traceEnd.ColumnNumber.(string); ok {
				if i, err := strconv.ParseInt(x, 10, 32); err == nil {
					cn = int(i)
				}
			}
			if cn != 0 {
				attrs = append(attrs, semconv.CodeColumnKey.Int(cn))
			}
			stackTrace := message
			for _, t := range row.Trace {
				if t.Source != "" {
					stackTrace += "\n" + t.Source
				} else {
					stackTrace += fmt.Sprintf("\n\tat %s (%s:%+v:%+v)", t.FunctionName, t.FileName, t.LineNumber, t.ColumnNumber)
				}
			}
			attrs = append(attrs, semconv.ExceptionStacktraceKey.String(stackTrace))
		}

		span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...), trace.WithTimestamp(time.UnixMilli(row.Time)))
		if row.Type == "error" {
			span.SetStatus(codes.Error, message)
		}
		highlight.EndTrace(span)
	}

	return nil
}

func submitVercelLog(ctx context.Context, projectID int, log VercelLog) {
	span, _ := highlight.StartTrace(
		ctx, "highlight-ctx",
		attribute.String(highlight.SourceAttribute, "SubmitVercelLogs"),
		attribute.String(highlight.ProjectIDAttribute, strconv.Itoa(projectID)),
	)
	defer highlight.EndTrace(span)

	attrs := []attribute.KeyValue{
		LogSeverityKey.String(log.Type),
		LogMessageKey.String(log.Message),
	}
	attrs = append(
		attrs,
		semconv.CodeNamespaceKey.String(log.Source),
		semconv.CodeFilepathKey.String(log.Path),
		semconv.CodeFunctionKey.String(log.Entrypoint),
		semconv.HostNameKey.String(log.Host),
		semconv.HTTPMethodKey.Int64(log.StatusCode),
	)

	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...), trace.WithTimestamp(time.UnixMilli(log.Timestamp)))
	if log.Type == "error" {
		span.SetStatus(codes.Error, log.Message)
	}
}

func SubmitVercelLogs(ctx context.Context, projectID int, logs []VercelLog) {
	if len(logs) == 0 {
		return
	}

	for _, log := range logs {
		submitVercelLog(ctx, projectID, log)
	}
}

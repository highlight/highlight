package hlog

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
	"runtime"
	"strconv"
	"strings"
	"time"
)

var (
	LogSeverityKey = attribute.Key(highlight.LogSeverityAttribute)
	LogMessageKey  = attribute.Key(highlight.LogMessageAttribute)
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

func HighlightTags(projectID, sessionID, requestID string) []attribute.KeyValue {
	tags := []attribute.KeyValue{
		attribute.String(highlight.ProjectIDAttribute, projectID),
	}
	if sessionID != "" {
		tags = append(tags, attribute.String(highlight.SessionIDAttribute, sessionID))
	}
	if requestID != "" {
		tags = append(tags, attribute.String(highlight.RequestIDAttribute, requestID))
	}
	return tags
}

func LogWithContext(ctx context.Context, level, message string, tags ...attribute.KeyValue) {
	span, _ := highlight.StartTrace(ctx, "highlight-go/log")
	defer highlight.EndTrace(span)

	attrs := []attribute.KeyValue{
		LogSeverityKey.String(level),
		LogMessageKey.String(message),
	}
	attrs = append(attrs, HighlightTags(highlight.GetProjectID(), "", "")...)
	if _, file, line, ok := runtime.Caller(1); ok {
		attrs = append(attrs, semconv.CodeFilepathKey.String(file))
		attrs = append(attrs, semconv.CodeLineNumberKey.Int(line))
	}
	attrs = append(attrs, tags...)

	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...))
	if strings.Contains(strings.ToLower(level), "error") {
		span.SetStatus(codes.Error, message)
	}
}

func Log(level, message string, tags ...attribute.KeyValue) {
	var tagsStr string
	if len(tags) > 0 {
		s, _ := json.Marshal(tags)
		tagsStr = fmt.Sprintf(" %s", s)
	}
	highlight.Print(fmt.Sprintf("[%s] %s%s\n", level, message, tagsStr))
	LogWithContext(context.TODO(), level, message, tags...)
}

func Trace(message string, tags ...attribute.KeyValue) {
	Log("trace", message, tags...)
}

func Debug(message string, tags ...attribute.KeyValue) {
	Log("debug", message, tags...)
}

func Info(message string, tags ...attribute.KeyValue) {
	Log("info", message, tags...)
}

func Warn(message string, tags ...attribute.KeyValue) {
	Log("warn", message, tags...)
}

func Error(message string, tags ...attribute.KeyValue) {
	Log("error", message, tags...)
}

func SubmitFrontendConsoleMessages(ctx context.Context, projectID int, sessionSecureID string, messages string) error {
	logRows, err := ParseConsoleMessages(messages)
	if err != nil {
		return err
	}

	if len(logRows) == 0 {
		return nil
	}

	span, _ := highlight.StartTrace(
		ctx, "highlight-ctx",
		attribute.String(highlight.SourceAttribute, highlight.SourceAttributeFrontend),
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
		}

		span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...), trace.WithTimestamp(time.UnixMilli(row.Time)))
		if row.Type == "error" {
			span.SetStatus(codes.Error, message)
		}
	}

	return nil
}

func submitVercelLog(ctx context.Context, projectID int, log VercelLog) {
	span, _ := highlight.StartTrace(
		ctx, "highlight-ctx",
		attribute.String("Source", "SubmitVercelLogs"),
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

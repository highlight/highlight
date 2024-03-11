package hlog

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"

	"github.com/highlight/highlight/sdk/highlight-go"
)

const TimestampFormat = "2006-01-02T15:04:05.000Z"
const TimestampFormatNano = "2006-01-02T15:04:05.999999999Z"
const LogAttributeValueLengthLimit = 2 << 15

type PinoLog struct {
	Level    uint8  `json:"level"`
	Time     int64  `json:"time"`
	PID      int64  `json:"pid"`
	Hostname string `json:"hostname"`
	Message  string `json:"msg"`
}

type PinoLogs struct {
	Logs []*PinoLog `json:"logs"`
}

type Log struct {
	Message    string `json:"message"`
	Timestamp  string `json:"timestamp"`
	Level      string `json:"level"`
	Attributes map[string]string
}

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
	Level      string `json:"level"`
	Entrypoint string `json:"entrypoint"`

	RequestId   string      `json:"requestId"`
	StatusCode  int64       `json:"statusCode"`
	Destination string      `json:"destination"`
	Path        string      `json:"path"`
	Proxy       VercelProxy `json:"proxy"`
}

func submitVercelLog(ctx context.Context, tracer trace.Tracer, projectID int, log VercelLog) {
	span, _ := highlight.StartTraceWithoutResourceAttributes(
		ctx, tracer, highlight.UtilitySpanName, []trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)},
		attribute.String(highlight.ProjectIDAttribute, strconv.Itoa(projectID)),
	)
	defer highlight.EndTrace(span)

	var level string
	if log.Type == "stdout" {
		level = "INFO"
	} else if log.Type == "stderr" {
		level = "ERROR"
	} else if log.Level == "warning" {
		level = "WARN"
	} else {
		level = strings.ToUpper(log.Level)
	}

	attrs := []attribute.KeyValue{
		LogSeverityKey.String(level),
		LogMessageKey.String(log.Message),
		semconv.ServiceNameKey.String("vercel-log-drain-" + log.ProjectId),
		semconv.ServiceVersionKey.String(log.DeploymentId),
		semconv.CodeNamespaceKey.String(log.Source),
		semconv.CodeFilepathKey.String(log.Path),
		semconv.CodeFunctionKey.String(log.Entrypoint),
		semconv.HostNameKey.String(log.Host),
	}

	if log.Proxy.Method != "" {
		attrs = append(attrs, semconv.HTTPMethodKey.String(log.Proxy.Method))
	}

	if log.StatusCode != 0 {
		attrs = append(attrs, semconv.HTTPStatusCodeKey.Int64(log.StatusCode))
	}

	if len(log.Proxy.UserAgent) > 0 {
		attrs = append(attrs, semconv.HTTPUserAgentKey.String(strings.Join(log.Proxy.UserAgent, ",")))
	}

	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...), trace.WithTimestamp(time.UnixMilli(log.Timestamp)))
	if log.Type == "error" {
		span.SetStatus(codes.Error, log.Message)
	}
}

func SubmitVercelLogs(ctx context.Context, tracer trace.Tracer, projectID int, logs []VercelLog) {
	if len(logs) == 0 {
		return
	}

	for _, log := range logs {
		submitVercelLog(ctx, tracer, projectID, log)
	}
}

func SubmitHTTPLog(ctx context.Context, tracer trace.Tracer, projectID int, lg Log) error {
	span, _ := highlight.StartTraceWithoutResourceAttributes(
		ctx, tracer, highlight.UtilitySpanName, []trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)},
		attribute.String(highlight.ProjectIDAttribute, strconv.Itoa(projectID)),
	)
	defer highlight.EndTrace(span)

	attrs := []attribute.KeyValue{
		LogSeverityKey.String(lg.Level),
		LogMessageKey.String(lg.Message),
	}
	for k, v := range lg.Attributes {
		attrs = append(attrs, attribute.String(k, v))
	}

	var t time.Time
	var err error
	t, err = time.Parse(TimestampFormat, lg.Timestamp)
	if err != nil {
		t, err = time.Parse(TimestampFormatNano, lg.Timestamp)
		if err != nil {
			return err
		}
	}
	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...), trace.WithTimestamp(t))
	if lg.Level == "error" {
		span.SetStatus(codes.Error, lg.Message)
	}
	return nil
}

func FormatLogAttributes(ctx context.Context, k string, v interface{}) map[string]string {
	if vStr, ok := v.(string); ok {
		if len(vStr) > LogAttributeValueLengthLimit {
			vStr = vStr[:LogAttributeValueLengthLimit] + "..."
		}
		return map[string]string{k: vStr}
	}
	if vInt, ok := v.(int64); ok {
		return map[string]string{k: strconv.FormatInt(vInt, 10)}
	}
	if vFlt, ok := v.(float64); ok {
		return map[string]string{k: strconv.FormatFloat(vFlt, 'f', -1, 64)}
	}
	if vMap, ok := v.(map[string]interface{}); ok {
		m := make(map[string]string)
		for mapKey, mapV := range vMap {
			for k2, v2 := range FormatLogAttributes(ctx, mapKey, mapV) {
				m[fmt.Sprintf("%s.%s", k, k2)] = v2
			}
		}
		return m
	}
	return nil
}

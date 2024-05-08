package clickhouse

import (
	"context"
	"strings"
	"time"

	hlog "github.com/highlight/highlight/sdk/highlight-go/log"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	log "github.com/sirupsen/logrus"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type LogRow struct {
	Timestamp       time.Time
	ProjectId       uint32
	TraceId         string
	SpanId          string
	SecureSessionId string
	UUID            string
	TraceFlags      uint32
	SeverityText    string
	SeverityNumber  int32
	Source          modelInputs.LogSource
	ServiceName     string
	ServiceVersion  string
	Body            string
	LogAttributes   map[string]string
	Environment     string
}

func NewLogRow(timestamp time.Time, projectID uint32, opts ...LogRowOption) *LogRow {
	// if the timestamp is zero, set time
	// TODO(et) - should we move this up to extractFields?
	if timestamp.Before(time.Unix(0, 1).UTC()) {
		timestamp = time.Now()
	}

	logRow := &LogRow{
		// ensure timestamp is written at second precision,
		// since clickhouse schema will truncate to second precision anyways.
		Timestamp:      timestamp.Truncate(time.Second),
		ProjectId:      projectID,
		UUID:           uuid.New().String(),
		SeverityText:   makeLogLevel("INFO").String(),
		SeverityNumber: int32(log.InfoLevel),
	}

	for _, opt := range opts {
		opt(logRow)
	}

	return logRow
}

func (l *LogRow) Cursor() string {
	return encodeCursor(l.Timestamp, l.UUID)
}

type LogRowOption func(*LogRow)

func WithTraceID(traceID string) LogRowOption {
	return func(l *LogRow) {
		l.TraceId = traceID
	}
}

func WithSpanID(spanID string) LogRowOption {
	return func(l *LogRow) {
		l.SpanId = spanID
	}
}

func WithSecureSessionID(secureSessionID string) LogRowOption {
	return func(l *LogRow) {
		l.SecureSessionId = secureSessionID
	}
}

func WithLogAttributes(attributes map[string]string) LogRowOption {
	return func(l *LogRow) {
		l.LogAttributes = attributes
	}
}

func WithSeverityText(severityText string) LogRowOption {
	logLevel := makeLogLevel(severityText)
	return func(l *LogRow) {
		l.SeverityText = logLevel.String()
		l.SeverityNumber = getSeverityNumber(logLevel)
	}
}

func WithSource(source modelInputs.LogSource) LogRowOption {
	return func(l *LogRow) {
		if source == modelInputs.LogSourceFrontend {
			l.Source = modelInputs.LogSourceFrontend
		} else {
			l.Source = modelInputs.LogSourceBackend
		}
	}
}

func WithBody(ctx context.Context, body string) LogRowOption {
	return func(l *LogRow) {
		if len(body) > hlog.LogAttributeValueLengthLimit {
			body = body[:hlog.LogAttributeValueLengthLimit] + "..."
		}
		l.Body = body
	}
}

func WithServiceName(serviceName string) LogRowOption {
	return func(l *LogRow) {
		l.ServiceName = serviceName
	}
}

func WithServiceVersion(version string) LogRowOption {
	return func(l *LogRow) {
		l.ServiceVersion = version
	}
}

func WithEnvironment(environment string) LogRowOption {
	return func(l *LogRow) {
		l.Environment = environment
	}
}

func makeLogLevel(severityText string) modelInputs.LogLevel {
	switch strings.ToLower(severityText) {
	case "console.error":
		return modelInputs.LogLevelError
	case "window.onerror":
		return modelInputs.LogLevelError
	case "trace":
		return modelInputs.LogLevelTrace
	case "debug":
		return modelInputs.LogLevelDebug
	case "warn":
		return modelInputs.LogLevelWarn
	case "warning":
		return modelInputs.LogLevelWarn
	case "error":
		return modelInputs.LogLevelError
	case "fatal":
		return modelInputs.LogLevelFatal
	case "panic":
		return modelInputs.LogLevelPanic
	default:
		return modelInputs.LogLevelInfo
	}
}

func getSeverityNumber(logLevel modelInputs.LogLevel) int32 {
	switch logLevel {
	case modelInputs.LogLevelTrace:
		return int32(log.TraceLevel)
	case modelInputs.LogLevelDebug:
		return int32(log.DebugLevel)
	case modelInputs.LogLevelInfo:
		return int32(log.InfoLevel)
	case modelInputs.LogLevelWarn:
		return int32(log.WarnLevel)
	case modelInputs.LogLevelError:
		return int32(log.ErrorLevel)
	case modelInputs.LogLevelFatal:
		return int32(log.FatalLevel)
	case modelInputs.LogLevelPanic:
		return int32(log.PanicLevel)
	default:
		return int32(log.InfoLevel)
	}
}

func getLogLevel(level logrus.Level) modelInputs.LogLevel {
	switch level {
	case log.TraceLevel:
		return modelInputs.LogLevelTrace
	case log.DebugLevel:
		return modelInputs.LogLevelDebug
	case log.InfoLevel:
		return modelInputs.LogLevelInfo
	case log.WarnLevel:
		return modelInputs.LogLevelWarn
	case log.ErrorLevel:
		return modelInputs.LogLevelError
	case log.FatalLevel:
		return modelInputs.LogLevelFatal
	case log.PanicLevel:
		return modelInputs.LogLevelPanic
	default:
		return modelInputs.LogLevelInfo
	}
}

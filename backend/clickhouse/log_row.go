package clickhouse

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/util"

	model2 "github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"

	"github.com/google/uuid"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	log "github.com/sirupsen/logrus"
)

func ProjectToInt(projectID string) (int, error) {
	i, err := strconv.ParseInt(projectID, 10, 32)
	if err == nil {
		return int(i), nil
	}
	i2, err := model2.FromVerboseID(projectID)
	if err == nil {
		return i2, nil
	}
	return 0, e.New(fmt.Sprintf("invalid project id %s", projectID))
}

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
}

func NewLogRow(timestamp time.Time, projectID uint32, opts ...LogRowOption) *LogRow {
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

func WithLogAttributes(ctx context.Context, resourceAttributes, spanAttributes, eventAttributes map[string]any, isFrontendLog bool) LogRowOption {
	return func(l *LogRow) {
		l.LogAttributes = GetAttributesMap(ctx, resourceAttributes, spanAttributes, eventAttributes, isFrontendLog)
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
		if len(body) > util.LogAttributeValueLengthLimit {
			log.WithContext(ctx).
				WithField("ValueLength", len(body)).
				WithField("ValueTrunc", body[:util.LogAttributeValueWarningLengthLimit]).
				Warnf("log body value is too long %d", len(body))
			body = body[:util.LogAttributeValueLengthLimit] + "..."
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

func GetAttributesMap(ctx context.Context, resourceAttributes, spanAttributes, eventAttributes map[string]any, isFrontendLog bool) map[string]string {
	attributesMap := make(map[string]string)
	for mIdx, m := range []map[string]any{resourceAttributes, spanAttributes, eventAttributes} {
		for k, v := range m {
			prefixes := highlight.InternalAttributePrefixes
			if isFrontendLog {
				prefixes = append(prefixes, highlight.BackendOnlyAttributePrefixes...)
			}

			shouldSkip := false
			for _, prefix := range prefixes {
				if strings.HasPrefix(k, prefix) {
					shouldSkip = true
					break
				}
			}
			if shouldSkip {
				continue
			}

			for key, value := range util.FormatLogAttributes(ctx, mIdx, k, v) {
				attributesMap[key] = value
			}
		}
	}
	return attributesMap
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
	case "error":
		return modelInputs.LogLevelError
	case "fatal":
		return modelInputs.LogLevelFatal
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
	default:
		return int32(log.InfoLevel)
	}

}

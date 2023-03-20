package clickhouse

import (
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	log "github.com/sirupsen/logrus"
)

type LogRowPrimaryAttrs struct {
	Timestamp       time.Time
	ProjectId       uint32
	TraceId         string
	SpanId          string
	SecureSessionId string
}

type LogRow struct {
	LogRowPrimaryAttrs
	UUID           string
	TraceFlags     uint32
	SeverityText   string
	SeverityNumber int32
	ServiceName    string
	Body           string
	LogAttributes  map[string]string
}

func NewLogRow(attrs LogRowPrimaryAttrs, opts ...LogRowOption) *LogRow {
	logRow := &LogRow{
		LogRowPrimaryAttrs: LogRowPrimaryAttrs{
			Timestamp:       attrs.Timestamp,
			TraceId:         attrs.TraceId,
			SpanId:          attrs.SpanId,
			ProjectId:       attrs.ProjectId,
			SecureSessionId: attrs.SecureSessionId,
		},
		UUID:           uuid.New().String(),
		SeverityText:   "INFO",
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

func WithLogAttributes(resourceAttributes, eventAttributes map[string]any) LogRowOption {
	return func(h *LogRow) {
		h.LogAttributes = getAttributesMap(resourceAttributes, eventAttributes)
	}
}

func WithSeverityText(severityText string) LogRowOption {
	logLevel := makeLogLevel(severityText)
	return func(h *LogRow) {
		h.SeverityText = logLevel.String()
		h.SeverityNumber = getSeverityNumber(logLevel)
	}
}

func cast[T string | int64 | float64](v interface{}, fallback T) T {
	c, ok := v.(T)
	if !ok {
		return fallback
	}
	return c
}

func getAttributesMap(resourceAttributes, eventAttributes map[string]any) map[string]string {
	attributesMap := make(map[string]string)
	for _, m := range []map[string]any{resourceAttributes, eventAttributes} {
		for k, v := range m {
			shouldSkip := false

			for _, attr := range highlight.InternalAttributes {
				if k == attr {
					shouldSkip = true
					break
				}
			}

			if shouldSkip {
				continue
			}

			vStr := cast(v, "")
			if vStr != "" {
				attributesMap[k] = vStr
			}
			vInt := cast[int64](v, 0)
			if vInt != 0 {
				attributesMap[k] = strconv.FormatInt(vInt, 10)
			}
			vFlt := cast(v, 0.)
			if vFlt > 0. {
				attributesMap[k] = strconv.FormatFloat(vFlt, 'f', -1, 64)
			}
		}
	}
	return attributesMap
}

func makeLogLevel(severityText string) modelInputs.LogLevel {
	switch strings.ToLower(severityText) {
	case "trace":
		{
			return modelInputs.LogLevelTrace

		}
	case "debug":
		{
			return modelInputs.LogLevelDebug

		}
	case "info":
		{
			return modelInputs.LogLevelInfo

		}
	case "warn":
		{
			return modelInputs.LogLevelWarn
		}
	case "error":
		{
			return modelInputs.LogLevelError
		}

	case "fatal":
		{
			return modelInputs.LogLevelFatal
		}

	default:
		return modelInputs.LogLevelInfo
	}
}

func getSeverityNumber(logLevel modelInputs.LogLevel) int32 {
	switch logLevel {
	case modelInputs.LogLevelTrace:
		{
			return int32(log.TraceLevel)

		}
	case modelInputs.LogLevelDebug:
		{
			return int32(log.DebugLevel)

		}
	case modelInputs.LogLevelInfo:
		{
			return int32(log.InfoLevel)

		}
	case modelInputs.LogLevelWarn:
		{
			return int32(log.WarnLevel)
		}
	case modelInputs.LogLevelError:
		{
			return int32(log.ErrorLevel)
		}

	case modelInputs.LogLevelFatal:
		{
			return int32(log.FatalLevel)
		}

	default:
		return int32(log.InfoLevel)
	}

}

package clickhouse

import (
	"fmt"
	model2 "github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	"strconv"
	"strings"
	"time"

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

func WithLogAttributes(resourceAttributes, eventAttributes map[string]any, isFrontendLog bool) LogRowOption {
	return func(h *LogRow) {
		h.LogAttributes = getAttributesMap(resourceAttributes, eventAttributes, isFrontendLog)
	}
}

func WithSeverityText(severityText string) LogRowOption {
	logLevel := makeLogLevel(severityText)
	return func(h *LogRow) {
		h.SeverityText = logLevel.String()
		h.SeverityNumber = getSeverityNumber(logLevel)
	}
}

func WithBody(body string) LogRowOption {
	return func(h *LogRow) {
		h.Body = body
	}
}

func WithServiceName(serviceName string) LogRowOption {
	return func(h *LogRow) {
		h.ServiceName = serviceName
	}
}

func WithProjectIDString(projectID string) LogRowOption {
	projectIDInt, err := ProjectToInt(projectID)
	return func(h *LogRow) {
		if err == nil {
			h.ProjectId = uint32(projectIDInt)
		}
	}
}

func cast[T string | int64 | float64](v interface{}, fallback T) T {
	c, ok := v.(T)
	if !ok {
		return fallback
	}
	return c
}

func getAttributesMap(resourceAttributes, eventAttributes map[string]any, isFrontendLog bool) map[string]string {
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

			if isFrontendLog {
				for _, attr := range highlight.BackendOnlyAttributePrefixes {
					if strings.HasPrefix(k, attr) {
						shouldSkip = true
						break
					}
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

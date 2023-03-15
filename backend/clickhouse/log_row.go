package clickhouse

import (
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/influxdata/influxdb-client-go/v2/log"
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
					continue
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

package otel

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/collector/pdata/pmetric"
)

type DataPoint interface {
	ToMetricRow(ctx context.Context, retentionDays uint8, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow
	ExtractAttributes() map[string]any
}

type NumberDataPoint struct {
	pmetric.NumberDataPoint
}

func (dp *NumberDataPoint) ExtractAttributes() map[string]any {
	return dp.Attributes().AsRaw()
}

func (dp *NumberDataPoint) ToMetricRow(ctx context.Context, retentionDays uint8, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
	ex := extractExemplars(dp.Exemplars(), fields)
	m := clickhouse.MetricSumRow{
		MetricBaseRow: clickhouse.MetricBaseRow{
			ProjectId:                uint32(fields.projectIDInt),
			ServiceName:              fields.serviceName,
			ServiceVersion:           fields.serviceVersion,
			MetricName:               fields.metricName,
			MetricDescription:        fields.metricDescription,
			MetricUnit:               fields.metricUnit,
			Attributes:               fields.attrs,
			MetricType:               metricType,
			Timestamp:                fields.timestamp,
			StartTimestamp:           dp.StartTimestamp().AsTime(),
			RetentionDays:            retentionDays,
			Flags:                    uint32(dp.Flags()),
			ExemplarsAttributes:      ex.Attributes,
			ExemplarsTimestamp:       ex.Timestamps,
			ExemplarsValue:           ex.Values,
			ExemplarsSpanID:          ex.SpanIDs,
			ExemplarsTraceID:         ex.TraceIDs,
			ExemplarsSecureSessionID: ex.SecureSessionIDs,
		},
	}
	if dp.ValueType() == pmetric.NumberDataPointValueTypeDouble {
		m.Value = dp.DoubleValue()
	} else if dp.ValueType() == pmetric.NumberDataPointValueTypeInt {
		m.Value = float64(dp.IntValue())
	}
	return &m
}

type HistogramDataPoint struct {
	pmetric.HistogramDataPoint
}

func (dp *HistogramDataPoint) ExtractAttributes() map[string]any {
	return dp.Attributes().AsRaw()
}

func (dp *HistogramDataPoint) ToMetricRow(ctx context.Context, retentionDays uint8, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
	ex := extractExemplars(dp.Exemplars(), fields)
	m := clickhouse.MetricHistogramRow{
		MetricBaseRow: clickhouse.MetricBaseRow{
			ProjectId:                uint32(fields.projectIDInt),
			ServiceName:              fields.serviceName,
			ServiceVersion:           fields.serviceVersion,
			MetricName:               fields.metricName,
			MetricDescription:        fields.metricDescription,
			MetricUnit:               fields.metricUnit,
			Attributes:               fields.attrs,
			MetricType:               metricType,
			Timestamp:                fields.timestamp,
			StartTimestamp:           dp.StartTimestamp().AsTime(),
			RetentionDays:            retentionDays,
			Flags:                    uint32(dp.Flags()),
			ExemplarsAttributes:      ex.Attributes,
			ExemplarsTimestamp:       ex.Timestamps,
			ExemplarsValue:           ex.Values,
			ExemplarsSpanID:          ex.SpanIDs,
			ExemplarsTraceID:         ex.TraceIDs,
			ExemplarsSecureSessionID: ex.SecureSessionIDs,
		},
		Count:          dp.Count(),
		Sum:            dp.Sum(),
		BucketCounts:   dp.BucketCounts().AsRaw(),
		ExplicitBounds: dp.ExplicitBounds().AsRaw(),
		Min:            dp.Min(),
		Max:            dp.Max(),
	}
	return &m
}

type ExponentialHistogramDataPoint struct {
	pmetric.ExponentialHistogramDataPoint
}

func (dp *ExponentialHistogramDataPoint) ExtractAttributes() map[string]any {
	return dp.Attributes().AsRaw()
}

func (dp *ExponentialHistogramDataPoint) ToMetricRow(ctx context.Context, retentionDays uint8, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
	log.WithContext(ctx).
		WithFields(log.Fields{
			"fields":         fields,
			"time":           dp.Timestamp().AsTime(),
			"start":          dp.StartTimestamp().AsTime(),
			"attrs":          dp.Attributes(),
			"exemplars":      dp.Exemplars(),
			"flags":          dp.Flags(),
			"negative":       dp.Negative(),
			"positive":       dp.Positive(),
			"sum":            dp.Sum(),
			"count":          dp.Count(),
			"min":            dp.Min(),
			"max":            dp.Max(),
			"scale":          dp.Scale(),
			"zero_count":     dp.ZeroCount(),
			"zero_threshold": dp.ZeroThreshold(),
		}).
		Warn("received otel metrics exp histogram - not implemented")
	// TODO(vkorolik) not implemented
	return nil
}

type SummaryDataPoint struct {
	pmetric.SummaryDataPoint
}

func (dp *SummaryDataPoint) ExtractAttributes() map[string]any {
	return dp.Attributes().AsRaw()
}

func (dp *SummaryDataPoint) ToMetricRow(ctx context.Context, retentionDays uint8, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
	quantiles := extractQuantiles(dp.QuantileValues())
	m := clickhouse.MetricSummaryRow{
		MetricBaseRow: clickhouse.MetricBaseRow{
			ProjectId:         uint32(fields.projectIDInt),
			ServiceName:       fields.serviceName,
			ServiceVersion:    fields.serviceVersion,
			MetricName:        fields.metricName,
			MetricDescription: fields.metricDescription,
			MetricUnit:        fields.metricUnit,
			Attributes:        fields.attrs,
			MetricType:        metricType,
			Timestamp:         fields.timestamp,
			StartTimestamp:    dp.StartTimestamp().AsTime(),
			RetentionDays:     retentionDays,
			Flags:             uint32(dp.Flags()),
		},
		Count:                    dp.Count(),
		Sum:                      dp.Sum(),
		ValueAtQuantilesQuantile: quantiles.Quantiles,
		ValueAtQuantilesValue:    quantiles.Values,
	}
	return &m
}

type quantiles struct {
	Quantiles []float64
	Values    []float64
}

func extractQuantiles(quantSlice pmetric.SummaryDataPointValueAtQuantileSlice) *quantiles {
	quantiles := quantiles{
		Quantiles: make([]float64, quantSlice.Len()),
		Values:    make([]float64, quantSlice.Len()),
	}
	for i := 0; i < quantSlice.Len(); i++ {
		q := quantSlice.At(i)
		quantiles.Quantiles = append(quantiles.Quantiles, q.Quantile())
		quantiles.Values = append(quantiles.Values, q.Value())
	}
	return &quantiles
}

type exemplars struct {
	Attributes       []map[string]string
	Timestamps       []time.Time
	Values           []float64
	SpanIDs          []string
	TraceIDs         []string
	SecureSessionIDs []string
}

func extractExemplars(exSlice pmetric.ExemplarSlice, fields *extractedFields) *exemplars {
	ex := exemplars{
		Attributes:       make([]map[string]string, exSlice.Len()),
		Timestamps:       make([]time.Time, exSlice.Len()),
		Values:           make([]float64, exSlice.Len()),
		SpanIDs:          make([]string, exSlice.Len()),
		TraceIDs:         make([]string, exSlice.Len()),
		SecureSessionIDs: make([]string, exSlice.Len()),
	}
	for i := 0; i < exSlice.Len(); i++ {
		e := exSlice.At(i)

		var value float64
		if e.ValueType() == pmetric.ExemplarValueTypeDouble {
			value = e.DoubleValue()
		} else if e.ValueType() == pmetric.ExemplarValueTypeInt {
			value = float64(e.IntValue())
		} else {
			continue
		}

		if e.Timestamp().AsTime().IsZero() {
			continue
		}

		var sessionID string
		attributes := make(map[string]string)
		for k, v := range e.FilteredAttributes().AsRaw() {
			if k == highlight.DeprecatedSessionIDAttribute || k == highlight.SessionIDAttribute {
				if val, ok := v.(string); ok {
					sessionID = val
					continue
				}
			}

			for key, value := range hlog.FormatAttributes(k, v) {
				if v != "" {
					attributes[key] = value
				}
			}
		}

		ex.Attributes = append(ex.Attributes, attributes)
		ex.Timestamps = append(ex.Timestamps, e.Timestamp().AsTime())
		ex.Values = append(ex.Values, value)
		ex.SpanIDs = append(ex.SpanIDs, e.SpanID().String())
		ex.TraceIDs = append(ex.TraceIDs, e.TraceID().String())
		ex.SecureSessionIDs = append(ex.SecureSessionIDs, sessionID)
	}
	// since the session id is queried as an exemplar, store it from the parsed attributes
	if fields.sessionID != "" {
		ex.Attributes = append(ex.Attributes, map[string]string{})
		ex.Timestamps = append(ex.Timestamps, time.Time{})
		ex.Values = append(ex.Values, 0)
		ex.SpanIDs = append(ex.SpanIDs, "")
		ex.TraceIDs = append(ex.TraceIDs, "")
		ex.SecureSessionIDs = append(ex.SecureSessionIDs, fields.sessionID)
	}
	return &ex
}

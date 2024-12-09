package otel

import (
	"context"
	"github.com/highlight-run/highlight/backend/clickhouse"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/collector/pdata/pmetric"
)

func getMetricRetention(projectID int) uint8 {
	// TODO(vkorolik) customizeable metrics retention
	return 30
}

type DataPoint interface {
	ToMetricRow(ctx context.Context, metricType pmetric.MetricType, fields *extractedFields) *clickhouse.MetricRow
	ExtractAttributes() map[string]any
}

type NumberDataPoint struct {
	pmetric.NumberDataPoint
}

func (dp *NumberDataPoint) ExtractAttributes() map[string]any {
	return dp.Attributes().AsRaw()
}

func (dp *NumberDataPoint) ToMetricRow(ctx context.Context, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
	m := clickhouse.MetricSumRow{
		MetricBaseRow: clickhouse.MetricBaseRow{
			ProjectID:         uint32(fields.projectIDInt),
			ServiceName:       fields.serviceName,
			ServiceVersion:    fields.serviceVersion,
			MetricName:        fields.metricName,
			MetricDescription: fields.metricDescription,
			MetricUnit:        fields.metricUnit,
			Attributes:        fields.attrs,
			MetricType:        metricType,
			Timestamp:         fields.timestamp,
			StartTimestamp:    dp.StartTimestamp().AsTime(),
			RetentionDays:     getMetricRetention(fields.projectIDInt),
			Flags:             uint32(dp.Flags()),
			// TODO(vkorolik)
			ExemplarsAttributes:      nil,
			ExemplarsTimestamp:       nil,
			ExemplarsValue:           nil,
			ExemplarsSpanID:          nil,
			ExemplarsTraceID:         nil,
			ExemplarsSecureSessionID: nil,
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

func (dp *HistogramDataPoint) ToMetricRow(ctx context.Context, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
	m := clickhouse.MetricHistogramRow{
		MetricBaseRow: clickhouse.MetricBaseRow{
			ProjectID:         uint32(fields.projectIDInt),
			ServiceName:       fields.serviceName,
			ServiceVersion:    fields.serviceVersion,
			MetricName:        fields.metricName,
			MetricDescription: fields.metricDescription,
			MetricUnit:        fields.metricUnit,
			Attributes:        fields.attrs,
			MetricType:        metricType,
			Timestamp:         fields.timestamp,
			StartTimestamp:    dp.StartTimestamp().AsTime(),
			RetentionDays:     getMetricRetention(fields.projectIDInt),
			Flags:             uint32(dp.Flags()),
			// TODO(vkorolik)
			ExemplarsAttributes:      nil,
			ExemplarsTimestamp:       nil,
			ExemplarsValue:           nil,
			ExemplarsSpanID:          nil,
			ExemplarsTraceID:         nil,
			ExemplarsSecureSessionID: nil,
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

func (dp *ExponentialHistogramDataPoint) ToMetricRow(ctx context.Context, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
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

func (dp *SummaryDataPoint) ToMetricRow(ctx context.Context, metricType pmetric.MetricType, fields *extractedFields) clickhouse.MetricRow {
	m := clickhouse.MetricSummaryRow{
		MetricBaseRow: clickhouse.MetricBaseRow{
			ProjectID:         uint32(fields.projectIDInt),
			ServiceName:       fields.serviceName,
			ServiceVersion:    fields.serviceVersion,
			MetricName:        fields.metricName,
			MetricDescription: fields.metricDescription,
			MetricUnit:        fields.metricUnit,
			Attributes:        fields.attrs,
			MetricType:        metricType,
			Timestamp:         fields.timestamp,
			StartTimestamp:    dp.StartTimestamp().AsTime(),
			RetentionDays:     getMetricRetention(fields.projectIDInt),
			Flags:             uint32(dp.Flags()),
		},
		Count: dp.Count(),
		Sum:   dp.Sum(),
		// TODO(vkorolik) implement
		ValueAtQuantilesQuantile: nil,
		ValueAtQuantilesValue:    nil,
	}
	return &m
}

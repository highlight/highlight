package clickhouse

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"go.opentelemetry.io/collector/pdata/pmetric"
	"time"
)

const MetricsSumTable = "metrics_sum"
const MetricsHistogramTable = "metrics_histogram"
const MetricsSummaryTable = "metrics_summary"

type MetricRow interface {
	GetType() pmetric.MetricType
}

type MetricBaseRow struct {
	ProjectID         uint32
	ServiceName       string
	ServiceVersion    string
	MetricName        string
	MetricDescription string
	MetricUnit        string
	Attributes        map[string]string

	Timestamp      time.Time
	StartTimestamp time.Time
	RetentionDays  uint8

	Flags uint32

	ExemplarsAttributes      []map[string]string `json:"Exemplars.Attributes" ch:"Exemplars.Attributes"`
	ExemplarsTimestamp       []time.Time         `json:"Exemplars.Timestamp" ch:"Exemplars.Timestamp"`
	ExemplarsValue           []float64           `json:"Exemplars.Value" ch:"Exemplars.Value"`
	ExemplarsSpanID          []string            `json:"Exemplars.SpanID" ch:"Exemplars.SpanID"`
	ExemplarsTraceID         []string            `json:"Exemplars.TraceID" ch:"Exemplars.TraceID"`
	ExemplarsSecureSessionID []string            `json:"Exemplars.SecureSessionID" ch:"Exemplars.SecureSessionID"`

	MetricType pmetric.MetricType `ch:"Type"`
}

type MetricSumRow struct {
	MetricBaseRow

	Value                  float64
	AggregationTemporality int32
	IsMonotonic            bool
}

func (m *MetricSumRow) GetType() pmetric.MetricType {
	return m.MetricType
}

type MetricHistogramRow struct {
	MetricBaseRow

	Count          uint64
	Sum            float64
	BucketCounts   []uint64
	ExplicitBounds []float64
	Min            float64
	Max            float64

	AggregationTemporality int32
}

func (m *MetricHistogramRow) GetType() pmetric.MetricType {
	return m.MetricType
}

type MetricSummaryRow struct {
	MetricBaseRow

	Count                    uint64
	Sum                      float64
	ValueAtQuantilesQuantile []float64 `json:"ValueAtQuantiles.Quantile" ch:"ValueAtQuantiles.Quantile"`
	ValueAtQuantilesValue    []float64 `json:"ValueAtQuantiles.Value" ch:"ValueAtQuantiles.Value"`
}

func (m *MetricSummaryRow) GetType() pmetric.MetricType {
	return m.MetricType
}

func (client *Client) BatchWriteMetricRows(ctx context.Context, metricSumRows []*MetricSumRow, metricHistogramRows []*MetricHistogramRow, metricSummaryRows []*MetricSummaryRow) error {
	for table, rows := range map[string][]MetricRow{
		MetricsSumTable: lo.Map(metricSumRows, func(item *MetricSumRow, _ int) MetricRow {
			return item
		}),
		MetricsHistogramTable: lo.Map(metricHistogramRows, func(item *MetricHistogramRow, _ int) MetricRow {
			return item
		}),
		MetricsSummaryTable: lo.Map(metricSummaryRows, func(item *MetricSummaryRow, _ int) MetricRow {
			return item
		}),
	} {
		if len(rows) == 0 {
			return nil
		}

		span, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.batched.otelMetrics.write"))
		span.SetAttribute("BatchSize", len(rows))
		span.SetAttribute("Table", table)

		batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", table))
		if err != nil {
			span.Finish(err)
			return e.Wrap(err, "failed to create metric batch")
		}

		for _, metricRow := range rows {
			if r, ok := metricRow.(*MetricSumRow); ok {
				if err = batch.AppendStruct(r); err != nil {
					span.Finish(err)
					return err
				}
			}
			if r, ok := metricRow.(*MetricHistogramRow); ok {
				if err = batch.AppendStruct(r); err != nil {
					span.Finish(err)
					return err
				}
			}
			if r, ok := metricRow.(*MetricSummaryRow); ok {
				if err = batch.AppendStruct(r); err != nil {
					span.Finish(err)
					return err
				}
			}
		}

		if err := batch.Send(); err != nil {
			span.Finish(err)
			return err
		}

		span.Finish()
	}
	return nil
}

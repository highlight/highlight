package clickhouse

import (
	"context"
	"fmt"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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
	GetProjectId() uint32
	GetTimestamp() time.Time
}

type MetricBaseRow struct {
	ProjectId         uint32
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

	MetricType pmetric.MetricType `ch:"MetricType"`
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
func (m *MetricSumRow) GetProjectId() uint32 {
	return m.ProjectId
}
func (m *MetricSumRow) GetTimestamp() time.Time {
	return m.Timestamp
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
func (m *MetricHistogramRow) GetProjectId() uint32 {
	return m.ProjectId
}
func (m *MetricHistogramRow) GetTimestamp() time.Time {
	return m.Timestamp
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
func (m *MetricSummaryRow) GetProjectId() uint32 {
	return m.ProjectId
}
func (m *MetricSummaryRow) GetTimestamp() time.Time {
	return m.Timestamp
}

func (client *Client) BatchWriteMetricRows(ctx context.Context, metricRows []MetricRow) error {
	for table, rows := range map[string][]MetricRow{
		MetricsSumTable: lo.Filter(metricRows, func(item MetricRow, _ int) bool {
			_, ok := item.(*MetricSumRow)
			return ok
		}),
		MetricsHistogramTable: lo.Filter(metricRows, func(item MetricRow, _ int) bool {
			_, ok := item.(*MetricHistogramRow)
			return ok
		}),
		MetricsSummaryTable: lo.Filter(metricRows, func(item MetricRow, _ int) bool {
			_, ok := item.(*MetricSummaryRow)
			return ok
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

func (client *Client) ReadMetricsDailySum(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (uint64, error) {
	return readDailyImpl[uint64](ctx, client, "metric_count_daily_mv", "count", projectIds, dateRange, []string{"ServiceName", "MetricName"})
}

func (client *Client) ReadMetricsDailyAverage(ctx context.Context, projectIds []int, dateRange modelInputs.DateRangeRequiredInput) (float64, error) {
	return readDailyImpl[float64](ctx, client, "metric_count_daily_mv", "count", projectIds, dateRange, []string{"ServiceName", "MetricName"})
}

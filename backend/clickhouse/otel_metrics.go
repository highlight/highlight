package clickhouse

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	"go.opentelemetry.io/collector/pdata/pmetric"
	"time"
)

const MetricsTable = "metrics"

type MetricRow struct {
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

	Type           pmetric.MetricType
	Value          float64
	Count          uint64
	Sum            float64
	BucketCounts   []uint64
	ExplicitBounds []float64
	Min            float64
	Max            float64

	ValueAtQuantilesQuantile []float64 `json:"ValueAtQuantiles.Quantile" ch:"ValueAtQuantiles.Quantile"`
	ValueAtQuantilesValue    []float64 `json:"ValueAtQuantiles.Value" ch:"ValueAtQuantiles.Value"`
}

func (client *Client) BatchWriteMetricRows(ctx context.Context, metricRows []*MetricRow) error {
	if len(metricRows) == 0 {
		return nil
	}

	span, _ := util.StartSpanFromContext(ctx, util.KafkaBatchWorkerOp, util.ResourceName("worker.kafka.batched.flushMetrics.prepareRows"))
	span.SetAttribute("BatchSize", len(metricRows))

	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", MetricsTable))
	if err != nil {
		span.Finish(err)
		return e.Wrap(err, "failed to create traces batch")
	}

	for _, metricRow := range metricRows {
		err = batch.AppendStruct(metricRow)
		if err != nil {
			span.Finish(err)
			return err
		}
	}
	span.Finish()

	return batch.Send()
}

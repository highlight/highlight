package clickhouse

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"go.opentelemetry.io/collector/pdata/pmetric"
	"time"
)

// TODO(vkorolik) drop trace_metrics
// TODO(vkorolik) create metric_keys, metric_key_values

const MetricsSumTable = "metrics_sum"

// TODO(vkorolik) query using MV
const MetricsHistogramTable = "metrics_histogram"

// TODO(vkorolik) remove everywhere
const MetricsSummaryTable = "metrics_summary"

var reservedMetricsSumKeys = lo.Map(modelInputs.AllReservedMetricKey, func(key modelInputs.ReservedMetricKey, _ int) string {
	return string(key)
})

var metricsSumKeysToColumns = map[string]string{
	string(modelInputs.ReservedMetricKeyServiceName): "ServiceName",
	string(modelInputs.ReservedMetricKeyMetricName):  "MetricName",
	// TODO(vkorolik) depends on the metric source table
	string(modelInputs.ReservedMetricKeyMetricValue):            "Sum",
	string(modelInputs.ReservedMetricKeyMetricDescription):      "MetricDescription",
	string(modelInputs.ReservedMetricKeyMetricUnit):             "MetricUnit",
	string(modelInputs.ReservedMetricKeyTimestamp):              "Timestamp",
	string(modelInputs.ReservedMetricKeyStartTimestamp):         "StartTimestamp",
	string(modelInputs.ReservedMetricKeyType):                   "Type",
	string(modelInputs.ReservedMetricKeyFlags):                  "Flags",
	string(modelInputs.ReservedMetricKeyValue):                  "Value",
	string(modelInputs.ReservedMetricKeyAggregationTemporality): "AggregationTemporality",
	string(modelInputs.ReservedMetricKeyIsMonotonic):            "IsMonotonic",
	// TODO(vkorolik) exemplars
}

var metricsSumColumns = []string{
	"ProjectId",
	"Timestamp",
	"ServiceName",
	"MetricName",
	"MetricDescription",
	"MetricUnit",
	"Attributes",
	"StartTimestamp",
	"Type",
	"Flags",
	"Exemplars.Attributes",
	"Exemplars.Timestamp",
	"Exemplars.Value",
	"Exemplars.SecureSessionID",
	"Exemplars.TraceID",
	"Exemplars.SpanID",
	"Value",
	"AggregationTemporality",
	"IsMonotonic",
}

var MetricsTableNoDefaultConfig = model.TableConfig{
	// TODO(vkorolik) mv
	TableName:     MetricsSummaryTable,
	KeysToColumns: metricsSumKeysToColumns,
	ReservedKeys:  reservedMetricsSumKeys,
	BodyColumn:    "MetricName",
	// TODO(vkorolik) should we implement AttributesColumns from the start?
	SelectColumns: metricsSumColumns,
}

var MetricsTableConfig = model.TableConfig{
	TableName:         MetricsTableNoDefaultConfig.TableName,
	KeysToColumns:     MetricsTableNoDefaultConfig.KeysToColumns,
	ReservedKeys:      MetricsTableNoDefaultConfig.ReservedKeys,
	BodyColumn:        MetricsTableNoDefaultConfig.BodyColumn,
	AttributesColumns: MetricsTableNoDefaultConfig.AttributesColumns,
	SelectColumns:     MetricsTableNoDefaultConfig.SelectColumns,
	DefaultFilter:     "",
}

var MetricsSampleableTableConfig = SampleableTableConfig{
	tableConfig:         MetricsTableConfig,
	samplingTableConfig: MetricsTableConfig,
	sampleSizeRows:      NoLimit,
}

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

func (client *Client) ReadMetricsAggregated(ctx context.Context, projectID int, params modelInputs.QueryInput, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string, expressions []*modelInputs.MetricExpressionInput) (*modelInputs.MetricsBuckets, error) {
	// TODO(vkorolik) default to processing metric_value column
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: MetricsSampleableTableConfig,
		ProjectIDs:       []int{projectID},
		Params:           params,
		GroupBy:          groupBy,
		BucketCount:      nBuckets,
		BucketWindow:     bucketWindow,
		BucketBy:         bucketBy,
		Limit:            limit,
		LimitAggregator:  limitAggregator,
		LimitColumn:      limitColumn,
		Expressions:      expressions,
	})
}

// TODO(vkorolik) merge with new stuff

func (client *Client) ReadWorkspaceMetricCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: MetricsSampleableTableConfig,
		ProjectIDs:       projectIDs,
		Params:           params,
		BucketCount:      pointy.Int(12),
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
		Expressions: []*modelInputs.MetricExpressionInput{{
			Aggregator: modelInputs.MetricAggregatorCount,
		}},
	})
}

func (client *Client) MetricsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	return KeysAggregated(ctx, client, MetricsSumTable, projectID, startDate, endDate, query, typeArg, nil)
}

func (client *Client) MetricsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, query *string, limit *int) ([]string, error) {
	return KeyValuesAggregated(ctx, client, MetricsSumTable, projectID, keyName, startDate, endDate, query, limit, nil)
}

// TODO(vkorolik) is this used?
func (client *Client) MetricsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, MetricsTableConfig, projectID, params)
}

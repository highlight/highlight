package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"go.opentelemetry.io/collector/pdata/pmetric"
)

const MetricsSumTable = "metrics_sum"
const MetricsHistogramTable = "metrics_histogram"
const MetricsSummaryTable = "metrics_summary"
const MetricsTable = "metrics"
const MetricKeysTable = "metric_keys"
const MetricKeyValuesTable = "metric_key_values"

// These keys show up as recommendations, but with no recommended values due to high cardinality
var defaultMetricKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedMetricKeyValue), Type: modelInputs.KeyTypeNumeric},
}

var reservedMetricsKeys = lo.Map(modelInputs.AllReservedMetricKey, func(key modelInputs.ReservedMetricKey, _ int) string {
	return string(key)
})

var metricsKeysToColumns = map[string]string{
	string(modelInputs.ReservedMetricKeyServiceName):       "ServiceName",
	string(modelInputs.ReservedMetricKeyMetricName):        "MetricName",
	string(modelInputs.ReservedMetricKeyType):              "Type",
	string(modelInputs.ReservedMetricKeyTimestamp):         "Timestamp",
	string(modelInputs.ReservedMetricKeyMetricDescription): "MetricDescription",
	string(modelInputs.ReservedMetricKeyMetricUnit):        "MetricUnit",
	string(modelInputs.ReservedMetricKeyStartTimestamp):    "StartTimestamp",
	string(modelInputs.ReservedMetricKeyValue):             "Sum / Count",
	string(modelInputs.ReservedMetricKeySecureSessionID):   "Exemplars.SecureSessionID",
	string(modelInputs.ReservedMetricKeyTraceID):           "Exemplars.TraceID",
	string(modelInputs.ReservedMetricKeySpanID):            "Exemplars.SpanID",
}

var metricsArrayColumns = map[string]bool{
	"Exemplars.SecureSessionID": true,
	"Exemplars.TraceID":         true,
	"Exemplars.SpanID":          true,
}

var metricsColumns = []string{
	"ProjectId",
	"ServiceName",
	"MetricName",
	"Type",
	"Timestamp",
	"MetricDescription",
	"MetricUnit",
	"Attributes",
	"StartTimestamp",
	"Exemplars.Attributes",
	"Exemplars.Timestamp",
	"Exemplars.Value",
	"Exemplars.SecureSessionID",
	"Exemplars.TraceID",
	"Exemplars.SpanID",
	"Min",
	"Max",
	"BucketCounts",
	"ExplicitBounds",
	"ValueAtQuantiles.Quantile",
	"ValueAtQuantiles.Value",
	"Count",
	"Sum",
}

var MetricsTableNoDefaultConfig = model.TableConfig{
	TableName:         MetricsTable,
	KeysToColumns:     metricsKeysToColumns,
	ArrayColumns:      metricsArrayColumns,
	ReservedKeys:      reservedMetricsKeys,
	BodyColumn:        "MetricName",
	SelectColumns:     metricsColumns,
	AttributesColumns: []model.ColumnMapping{{Column: "Attributes"}},
}

var MetricsTableConfig = model.TableConfig{
	TableName:         MetricsTableNoDefaultConfig.TableName,
	KeysToColumns:     MetricsTableNoDefaultConfig.KeysToColumns,
	ArrayColumns:      MetricsTableNoDefaultConfig.ArrayColumns,
	ReservedKeys:      MetricsTableNoDefaultConfig.ReservedKeys,
	BodyColumn:        MetricsTableNoDefaultConfig.BodyColumn,
	AttributesColumns: MetricsTableNoDefaultConfig.AttributesColumns,
	SelectColumns:     MetricsTableNoDefaultConfig.SelectColumns,
	DefaultFilter:     "",
}

// no sampling for metrics
var MetricsSampleableTableConfig = SampleableTableConfig{
	tableConfig: MetricsTableConfig,
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

func (client *Client) ReadMetricsAggregated(ctx context.Context, projectID int, params modelInputs.QueryInput, sql *string, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string, expressions []*modelInputs.MetricExpressionInput) (*modelInputs.MetricsBuckets, error) {
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: MetricsSampleableTableConfig,
		ProjectIDs:       []int{projectID},
		Params:           params,
		Sql:              sql,
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

func (client *Client) QuerySessionCustomMetrics(ctx context.Context, projectId int, sessionSecureId string, created time.Time, metricNames []string) (*modelInputs.MetricsBuckets, error) {
	day := 24 * time.Hour
	query := strings.Join(lo.Map(metricNames, func(m string, _ int) string {
		return fmt.Sprintf("%s=%s", modelInputs.ReservedMetricKeyMetricName.String(), m)
	}), " OR ")
	query = fmt.Sprintf("%s=%s AND (%s)", modelInputs.ReservedMetricKeySecureSessionID.String(), sessionSecureId, query)
	params := modelInputs.QueryInput{
		Query: query,
		DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: created,
			EndDate:   created.Add(day),
		},
	}
	return client.ReadMetricsAggregated(ctx, projectId, params, nil, []string{modelInputs.ReservedMetricKeyMetricName.String()}, nil, modelInputs.MetricBucketByTimestamp.String(), ptr.Int(int(day.Seconds())), nil, nil, nil, []*modelInputs.MetricExpressionInput{
		{
			Aggregator: modelInputs.MetricAggregatorAvg,
			Column:     modelInputs.ReservedMetricKeyValue.String(),
		},
	})
}

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
	metricKeys, err := KeysAggregated(ctx, client, MetricKeysTable, projectID, startDate, endDate, query, typeArg, nil)
	if err != nil {
		return nil, err
	}

	if query == nil || *query == "" {
		metricKeys = append(metricKeys, defaultMetricKeys...)
	} else {
		queryLower := strings.ToLower(*query)
		for _, key := range defaultMetricKeys {
			if strings.Contains(key.Name, queryLower) {
				metricKeys = append(metricKeys, key)
			}
		}
	}

	return metricKeys, nil
}

func (client *Client) MetricsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, query *string, limit *int) ([]string, error) {
	return KeyValuesAggregated(ctx, client, MetricKeyValuesTable, projectID, keyName, startDate, endDate, query, limit, nil)
}

func (client *Client) MetricsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, MetricsTableConfig, projectID, params)
}

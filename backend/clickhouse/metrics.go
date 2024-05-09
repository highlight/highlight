package clickhouse

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const MetricKeysTable = "metric_keys"
const MetricKeyValuesTable = "metric_key_values"

var metricsTableConfig = model.TableConfig[modelInputs.ReservedTraceKey]{
	TableName:        TracesTableNoDefaultConfig.TableName,
	KeysToColumns:    TracesTableNoDefaultConfig.KeysToColumns,
	ReservedKeys:     TracesTableNoDefaultConfig.ReservedKeys,
	BodyColumn:       TracesTableNoDefaultConfig.BodyColumn,
	AttributesColumn: TracesTableNoDefaultConfig.AttributesColumn,
	SelectColumns:    TracesTableNoDefaultConfig.SelectColumns,
}

var metricsSamplingTableConfig = model.TableConfig[modelInputs.ReservedTraceKey]{
	TableName:        fmt.Sprintf("%s SAMPLE %d", TracesSamplingTable, SamplingRows),
	BodyColumn:       "SpanName",
	KeysToColumns:    traceKeysToColumns,
	ReservedKeys:     modelInputs.AllReservedTraceKey,
	AttributesColumn: "TraceAttributes",
	SelectColumns:    traceColumns,
}

var metricsSampleableTableConfig = sampleableTableConfig[modelInputs.ReservedTraceKey]{
	tableConfig:         metricsTableConfig,
	samplingTableConfig: metricsSamplingTableConfig,
	useSampling: func(d time.Duration) bool {
		return d >= time.Hour
	},
}

func (client *Client) ReadEventMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return readMetrics(ctx, client, metricsSampleableTableConfig, projectID, params, column, metricTypes, groupBy, nBuckets, bucketBy, limit, limitAggregator, limitColumn)
}

func (client *Client) ReadWorkspaceMetricCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return readWorkspaceMetrics(ctx, client, tracesSampleableTableConfig, projectIDs, params, "", []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount}, nil, pointy.Int(12), modelInputs.MetricBucketByTimestamp.String(), nil, nil, nil)
}

func (client *Client) MetricsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	metricKeys, err := KeysAggregated(ctx, client, MetricKeysTable, projectID, startDate, endDate, query, typeArg)
	if err != nil {
		return nil, err
	}

	return metricKeys, nil
}

func (client *Client) MetricsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	return KeyValuesAggregated(ctx, client, MetricKeyValuesTable, projectID, keyName, startDate, endDate)
}

func (client *Client) MetricsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, metricsTableConfig, projectID, params)
}

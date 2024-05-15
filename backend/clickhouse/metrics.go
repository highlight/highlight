package clickhouse

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const MetricNamesTable = "trace_metrics"

var metricsTableConfig = model.TableConfig[modelInputs.ReservedTraceKey]{
	AttributesColumn: TracesTableNoDefaultConfig.AttributesColumn,
	BodyColumn:       TracesTableNoDefaultConfig.BodyColumn,
	KeysToColumns:    TracesTableNoDefaultConfig.KeysToColumns,
	ReservedKeys:     TracesTableNoDefaultConfig.ReservedKeys,
	SelectColumns:    TracesTableNoDefaultConfig.SelectColumns,
	TableName:        TracesTableNoDefaultConfig.TableName,
}

var metricsSamplingTableConfig = model.TableConfig[modelInputs.ReservedTraceKey]{
	AttributesColumn: metricsTableConfig.AttributesColumn,
	BodyColumn:       metricsTableConfig.BodyColumn,
	KeysToColumns:    metricsTableConfig.KeysToColumns,
	ReservedKeys:     metricsTableConfig.ReservedKeys,
	SelectColumns:    metricsTableConfig.SelectColumns,
	TableName:        fmt.Sprintf("%s SAMPLE %d", TracesSamplingTable, SamplingRows),
}

var metricsSampleableTableConfig = sampleableTableConfig[modelInputs.ReservedTraceKey]{
	tableConfig:         metricsTableConfig,
	samplingTableConfig: metricsSamplingTableConfig,
	useSampling: func(d time.Duration) bool {
		return d >= time.Hour
	},
}

func (client *Client) ReadEventMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	params.Query = params.Query + " " + modelInputs.ReservedTraceKeyMetricName.String() + "=" + column
	return readWorkspaceMetrics(ctx, client, metricsSampleableTableConfig, []int{projectID}, params, modelInputs.ReservedTraceKeyMetricValue.String(), metricTypes, groupBy, nBuckets, bucketBy, limit, limitAggregator, limitColumn)
}

func (client *Client) ReadWorkspaceMetricCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	params.Query = params.Query + " " + modelInputs.ReservedTraceKeyMetricValue.String() + " exists"
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return readWorkspaceMetrics(ctx, client, metricsSampleableTableConfig, projectIDs, params, "", []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount}, nil, pointy.Int(12), modelInputs.MetricBucketByTimestamp.String(), nil, nil, nil)

}

func (client *Client) MetricsKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	table := TraceKeysTable
	if typeArg != nil && *typeArg == modelInputs.KeyTypeNumeric {
		table = MetricNamesTable
	}
	metricKeys, err := KeysAggregated(ctx, client, table, projectID, startDate, endDate, query, typeArg)
	if err != nil {
		return nil, err
	}

	return metricKeys, nil
}

func (client *Client) MetricsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	return KeyValuesAggregated(ctx, client, TraceKeyValuesTable, projectID, keyName, startDate, endDate)
}

func (client *Client) MetricsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, metricsTableConfig, projectID, params)
}

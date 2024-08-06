package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const MetricNamesTable = "trace_metrics"

var metricsTableConfig = model.TableConfig{
	AttributesColumn: TracesTableNoDefaultConfig.AttributesColumn,
	BodyColumn:       TracesTableNoDefaultConfig.BodyColumn,
	KeysToColumns:    TracesTableNoDefaultConfig.KeysToColumns,
	ReservedKeys:     TracesTableNoDefaultConfig.ReservedKeys,
	SelectColumns:    TracesTableNoDefaultConfig.SelectColumns,
	TableName:        TracesTableNoDefaultConfig.TableName,
}

var metricsSamplingTableConfig = model.TableConfig{
	AttributesColumn: metricsTableConfig.AttributesColumn,
	BodyColumn:       metricsTableConfig.BodyColumn,
	KeysToColumns:    metricsTableConfig.KeysToColumns,
	ReservedKeys:     metricsTableConfig.ReservedKeys,
	SelectColumns:    metricsTableConfig.SelectColumns,
	TableName:        fmt.Sprintf("%s SAMPLE %d", TracesSamplingTable, SamplingRows),
}

var MetricsSampleableTableConfig = SampleableTableConfig{
	tableConfig:         metricsTableConfig,
	samplingTableConfig: metricsSamplingTableConfig,
	useSampling: func(d time.Duration) bool {
		return d >= time.Hour
	},
}

func (client *Client) ReadEventMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	params.Query = params.Query + " " + modelInputs.ReservedTraceKeyMetricName.String() + "=" + column
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: MetricsSampleableTableConfig,
		ProjectIDs:       []int{projectID},
		Params:           params,
		Column:           column,
		MetricTypes:      metricTypes,
		GroupBy:          groupBy,
		BucketCount:      nBuckets,
		BucketWindow:     bucketWindow,
		BucketBy:         bucketBy,
		Limit:            limit,
		LimitAggregator:  limitAggregator,
		LimitColumn:      limitColumn,
	})
}

func (client *Client) ReadWorkspaceMetricCounts(ctx context.Context, projectIDs []int, params modelInputs.QueryInput) (*modelInputs.MetricsBuckets, error) {
	params.Query = params.Query + " " + modelInputs.ReservedTraceKeyMetricValue.String() + " exists"
	// 12 buckets - 12 months in a year, or 12 weeks in a quarter
	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: MetricsSampleableTableConfig,
		ProjectIDs:       projectIDs,
		Params:           params,
		Column:           "",
		MetricTypes:      []modelInputs.MetricAggregator{modelInputs.MetricAggregatorCount},
		BucketCount:      pointy.Int(12),
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
	})
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

func (client *Client) MetricsKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, limit *int) ([]string, error) {
	return KeyValuesAggregated(ctx, client, TraceKeyValuesTable, projectID, keyName, startDate, endDate, limit)
}

func (client *Client) MetricsLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, metricsTableConfig, projectID, params)
}

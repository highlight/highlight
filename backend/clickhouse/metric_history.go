package clickhouse

import (
	"context"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"

	"github.com/huandu/go-sqlbuilder"
)

const MetricHistoryTable = "metric_history"
const MetricHistoryMaxLookback = time.Hour

type SavedMetricState struct {
	MetricId        string
	BlockNumberInfo []BlockNumberInfo
}

type BlockNumberInfo struct {
	Partition       string
	LastBlockNumber int
}

func (client *Client) GetBlockNumbers(ctx context.Context, metricId string, endDate time.Time) ([]BlockNumberInfo, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("toString(toDate(date_trunc('day', Timestamp)))",
		"maxMerge(MaxBlockNumberState)")
	sb.From(MetricHistoryTable)
	sb.Where(sb.Equal("MetricId", metricId))
	sb.Where(sb.GreaterEqualThan("Timestamp", endDate.Add(-MetricHistoryMaxLookback)))
	sb.Where(sb.LessThan("Timestamp", endDate))
	sb.GroupBy("1")

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	var results []BlockNumberInfo
	for rows.Next() {
		var result BlockNumberInfo
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}
		results = append(results, result)
	}

	return results, nil
}

type AggregatedMetricResults struct {
	GroupByKey string
	Value      float64
}

func (client *Client) AggregateMetricStates(ctx context.Context, metricId string, endDate time.Time, interval time.Duration, aggregator modelInputs.MetricAggregator) ([]AggregatedMetricResults, error) {
	sb := sqlbuilder.NewSelectBuilder()
	selectCols := []string{"GroupByKey"}
	switch aggregator {
	case modelInputs.MetricAggregatorCount:
		selectCols = append(selectCols, "toFloat64(countMerge(CountState))")
	case modelInputs.MetricAggregatorCountDistinct:
	case modelInputs.MetricAggregatorCountDistinctKey:
		selectCols = append(selectCols, "toFloat64(uniqMerge(UniqState))")
	case modelInputs.MetricAggregatorMin:
		selectCols = append(selectCols, "minMerge(MinState)")
	case modelInputs.MetricAggregatorAvg:
		selectCols = append(selectCols, "avgMerge(AvgState)")
	case modelInputs.MetricAggregatorMax:
		selectCols = append(selectCols, "maxMerge(MaxState)")
	case modelInputs.MetricAggregatorSum:
		selectCols = append(selectCols, "sumMerge(SumState)")
	case modelInputs.MetricAggregatorP50:
		selectCols = append(selectCols, "quantileMerge(.5)(P50State)")
	case modelInputs.MetricAggregatorP90:
		selectCols = append(selectCols, "quantileMerge(.9)(P90State)")
	case modelInputs.MetricAggregatorP95:
		selectCols = append(selectCols, "quantileMerge(.95)(P95State)")
	case modelInputs.MetricAggregatorP99:
		selectCols = append(selectCols, "quantileMerge(.99)(P99State)")
	}
	sb.Select(selectCols...)
	sb.From(MetricHistoryTable)
	sb.Where(sb.Equal("MetricId", metricId))
	sb.Where(sb.GreaterEqualThan("Timestamp", endDate.Add(-interval)))
	sb.Where(sb.LessThan("Timestamp", endDate))
	sb.GroupBy("GroupByKey")

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	results := []AggregatedMetricResults{}
	var result AggregatedMetricResults
	for rows.Next() {
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}
		results = append(results, result)
	}

	return results, nil
}

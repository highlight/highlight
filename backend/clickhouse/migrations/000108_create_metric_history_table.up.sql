CREATE TABLE IF NOT EXISTS metric_history (
    MetricId UUID,
    Timestamp DateTime,
    GroupByKey String,
    MaxBlockNumberState AggregateFunction(max, UInt64),
    CountState AggregateFunction(count, UInt64),
    UniqState AggregateFunction(uniq, String),
    MinState AggregateFunction(min, Float64),
    AvgState AggregateFunction(avg, Float64),
    MaxState AggregateFunction(max, Float64),
    SumState AggregateFunction(sum, Float64),
    P50State AggregateFunction(quantile(.5), Float64),
    P90State AggregateFunction(quantile(.9), Float64),
    P95State AggregateFunction(quantile(.95), Float64),
    P99State AggregateFunction(quantile(.99), Float64)
) ENGINE = AggregatingMergeTree
ORDER BY (MetricId, Timestamp, GroupByKey)
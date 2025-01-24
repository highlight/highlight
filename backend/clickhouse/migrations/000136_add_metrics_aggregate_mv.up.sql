CREATE TABLE IF NOT EXISTS metrics
(
    `ProjectId`         UInt32,
    `ServiceName`       String,
    `MetricName`        String,
    `MetricType`        Enum8('Empty' = 0, 'Gauge' = 1, 'Sum' = 2, 'Histogram' = 3, 'ExponentialHistogram' = 4, 'Summary' = 5),
    `Attributes`        Map(LowCardinality(String), String),
    `Timestamp`         DateTime CODEC (Delta(4), ZSTD(1)),
    -- meta
    `MetricDescription` SimpleAggregateFunction(anyLast, String),
    `MetricUnit`        SimpleAggregateFunction(anyLast, String),
    `StartTimestamp`    SimpleAggregateFunction(min, DateTime64(9)) CODEC (Delta(8), ZSTD(1)),
    `RetentionDays`     SimpleAggregateFunction(max, UInt8) DEFAULT 30,
    `Exemplars.Attributes` SimpleAggregateFunction(groupArrayArray, Array(Map(String, String))),
    `Exemplars.Timestamp` SimpleAggregateFunction(groupArrayArray, Array(DateTime64(9))),
    `Exemplars.Value` SimpleAggregateFunction(groupArrayArray, Array(Float64)),
    `Exemplars.SpanID` SimpleAggregateFunction(groupArrayArray, Array(String)),
    `Exemplars.TraceID` SimpleAggregateFunction(groupArrayArray, Array(String)),
    `Exemplars.SecureSessionID` SimpleAggregateFunction(groupArrayArray, Array(String)),
    -- histogram
    `Min`               SimpleAggregateFunction(min, Float64),
    `Max`               SimpleAggregateFunction(max, Float64),
    `BucketCounts`      SimpleAggregateFunction(groupArrayArray, Array(UInt64)),
    `ExplicitBounds`    SimpleAggregateFunction(groupArrayArray, Array(Float64)),
    -- summary
    `ValueAtQuantiles.Quantile` SimpleAggregateFunction(groupArrayArray, Array(Float64)),
    `ValueAtQuantiles.Value` SimpleAggregateFunction(groupArrayArray, Array(Float64)),
    -- common
    `Count`             SimpleAggregateFunction(sum, UInt64),
    `Sum`               SimpleAggregateFunction(sum, Float64)
)
    ENGINE = AggregatingMergeTree()
        PARTITION BY toStartOfDay(Timestamp)
        ORDER BY (ProjectId, ServiceName, MetricName, MetricType, Attributes, toUnixTimestamp(Timestamp))
        TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);

CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_sum_mv TO metrics AS
SELECT ProjectId,
       ServiceName,
       MetricName,
       MetricType,
       Attributes,
       toDateTime(toStartOfSecond(Timestamp))                as Timestamp,
       -- meta
       anyLastSimpleState(MetricDescription)                 as MetricDescription,
       anyLastSimpleState(MetricUnit)                        as MetricUnit,
       minSimpleState(StartTimestamp)                        as StartTimestamp,
       maxSimpleState(RetentionDays)                         as RetentionDays,
       groupArrayArraySimpleState(Exemplars.Attributes)      as `Exemplars.Attributes`,
       groupArrayArraySimpleState(Exemplars.Timestamp)       as `Exemplars.Timestamp`,
       groupArrayArraySimpleState(Exemplars.Value)           as `Exemplars.Value`,
       groupArrayArraySimpleState(Exemplars.SpanID)          as `Exemplars.SpanID`,
       groupArrayArraySimpleState(Exemplars.TraceID)         as `Exemplars.TraceID`,
       groupArrayArraySimpleState(Exemplars.SecureSessionID) as `Exemplars.SecureSessionID`,
       -- sum
       sumSimpleState(1)                                     as Count,
       sumSimpleState(Value)                                 as Sum
FROM metrics_sum
GROUP BY all;

CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_histogram_mv TO metrics AS
SELECT ProjectId,
       ServiceName,
       MetricName,
       'Histogram'                                           as MetricType,
       Attributes,
       toDateTime(toStartOfSecond(Timestamp))                as Timestamp,
       -- meta
       anyLastSimpleState(MetricDescription)                 as MetricDescription,
       anyLastSimpleState(MetricUnit)                        as MetricUnit,
       minSimpleState(StartTimestamp)                        as StartTimestamp,
       maxSimpleState(RetentionDays)                         as RetentionDays,
       groupArrayArraySimpleState(Exemplars.Attributes)      as `Exemplars.Attributes`,
       groupArrayArraySimpleState(Exemplars.Timestamp)       as `Exemplars.Timestamp`,
       groupArrayArraySimpleState(Exemplars.Value)           as `Exemplars.Value`,
       groupArrayArraySimpleState(Exemplars.SpanID)          as `Exemplars.SpanID`,
       groupArrayArraySimpleState(Exemplars.TraceID)         as `Exemplars.TraceID`,
       groupArrayArraySimpleState(Exemplars.SecureSessionID) as `Exemplars.SecureSessionID`,
       -- histogram
       minSimpleState(Min)                                   as Min,
       minSimpleState(Max)                                   as Max,
       groupArrayArraySimpleState(BucketCounts)              as BucketCounts,
       groupArrayArraySimpleState(ExplicitBounds)            as ExplicitBounds,
       sumSimpleState(Count)                                 as Count,
       sumSimpleState(Sum)                                   as Sum
FROM metrics_histogram
GROUP BY all;

CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_summary_mv TO metrics AS
SELECT ProjectId,
       ServiceName,
       MetricName,
       'Summary'                                             as MetricType,
       Attributes,
       toDateTime(toStartOfSecond(Timestamp))                as Timestamp,
       -- meta
       anyLastSimpleState(MetricDescription)                 as MetricDescription,
       anyLastSimpleState(MetricUnit)                        as MetricUnit,
       minSimpleState(StartTimestamp)                        as StartTimestamp,
       maxSimpleState(RetentionDays)                         as RetentionDays,
       -- summary
       groupArrayArraySimpleState(ValueAtQuantiles.Quantile) as `ValueAtQuantiles.Quantile`,
       groupArrayArraySimpleState(ValueAtQuantiles.Value)    as `ValueAtQuantiles.Value`,
       sumSimpleState(Count)                                 as Count,
       sumSimpleState(Sum)                                   as Sum
FROM metrics_summary
GROUP BY all;

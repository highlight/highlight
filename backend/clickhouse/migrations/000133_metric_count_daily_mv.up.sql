CREATE TABLE metric_count_daily_mv
(
    `ProjectId`   UInt32,
    `Day`         DateTime,
    `ServiceName` LowCardinality(String),
    `MetricName`  String,
    `Count`       UInt64
) ENGINE = SummingMergeTree ORDER BY (ProjectId, Day, ServiceName, MetricName);

CREATE MATERIALIZED VIEW metric_count_daily_mv_sum
    TO metric_count_daily_mv
AS
SELECT ProjectId,
       toStartOfDay(Timestamp) AS Day,
       ServiceName,
       MetricName,
       count()                 as Count
FROM metrics_sum
GROUP BY ProjectId, Day, ServiceName, MetricName;

CREATE MATERIALIZED VIEW metric_count_daily_mv_histogram
    TO metric_count_daily_mv
AS
SELECT ProjectId,
       toStartOfDay(Timestamp) AS Day,
       ServiceName,
       MetricName,
       count()                 as Count
FROM metrics_histogram
GROUP BY ProjectId, Day, ServiceName, MetricName;

CREATE MATERIALIZED VIEW metric_count_daily_mv_summary
    TO metric_count_daily_mv
AS
SELECT ProjectId,
       toStartOfDay(Timestamp) AS Day,
       ServiceName,
       MetricName,
       count()                 as Count
FROM metrics_summary
GROUP BY ProjectId, Day, ServiceName, MetricName;

DROP TABLE IF EXISTS trace_key_values;
CREATE TABLE IF NOT EXISTS trace_key_values
(
    `ProjectId` Int32,
    `Key`       LowCardinality(String),
    `Day`       DateTime,
    `Value`     String,
    `Type`      LowCardinality(String),
    `Count`     UInt64
) ENGINE = SummingMergeTree
      ORDER BY (ProjectId, Key, Day, Value, Type) TTL Day + toIntervalDay(31);

DROP VIEW IF EXISTS trace_metrics_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_metrics_mv
            TO trace_key_values (
                                 `ProjectId` Int32,
                                 `Key` LowCardinality(String),
                                 `Day` DateTime,
                                 `Value` String,
                                 `Type`  LowCardinality(String),
                                 `Count` UInt64
        )
AS
SELECT ProjectId,
       Events.Attributes[1]['metric.name']                   AS Key,
       toStartOfDay(Timestamp)                               AS Day,
       toFloat64OrNull(Events.Attributes[1]['metric.value']) AS Value,
       'metric'                                              AS Type,
       count()                                               AS Count
FROM traces
WHERE Events.Attributes[1]['metric.value'] != ''
GROUP BY ProjectId,
         Key,
         Day,
         Value;

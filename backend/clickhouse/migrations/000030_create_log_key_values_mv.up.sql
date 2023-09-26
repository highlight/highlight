CREATE MATERIALIZED VIEW IF NOT EXISTS log_key_values_mv TO log_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    Key,
    toStartOfDay(LogTimestamp) AS Day,
    Value,
    count() AS Count
FROM log_attributes
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS default.log_key_values_mv TO default.log_key_values (
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
FROM default.log_attributes
GROUP BY ProjectId,
    Key,
    Day,
    Value;
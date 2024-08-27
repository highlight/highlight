CREATE MATERIALIZED VIEW IF NOT EXISTS event_key_values_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    Key,
    toStartOfDay(TraceTimestamp) AS Day,
    Value,
    count() AS Count
FROM event_attributes
GROUP BY ProjectId,
    Key,
    Day,
    Value;
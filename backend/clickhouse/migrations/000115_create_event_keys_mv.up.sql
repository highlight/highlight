CREATE MATERIALIZED VIEW IF NOT EXISTS event_keys_mv TO event_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64
) AS
SELECT ProjectId,
    Key,
    Day,
    sum(Count) AS Count
FROM event_key_values
GROUP BY ProjectId,
    Key,
    Day;
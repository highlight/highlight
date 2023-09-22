CREATE MATERIALIZED VIEW IF NOT EXISTS log_keys_mv TO log_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64
) AS
SELECT ProjectId,
    Key,
    Day,
    sum(Count) AS Count
FROM log_key_values
GROUP BY ProjectId,
    Key,
    Day;
CREATE MATERIALIZED VIEW IF NOT EXISTS default.log_keys_mv TO default.log_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64
) AS
SELECT ProjectId,
    Key,
    Day,
    sum(Count) AS Count
FROM default.log_key_values
GROUP BY ProjectId,
    Key,
    Day;
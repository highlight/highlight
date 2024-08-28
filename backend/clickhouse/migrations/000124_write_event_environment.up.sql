CREATE MATERIALIZED VIEW IF NOT EXISTS event_environment_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'environment' AS Key,
    toStartOfDay(CreatedAt) AS Day,
    Environment AS Value,
    count() AS Count
FROM sessions
WHERE (Environment != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS event_service_version_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'service_version' AS Key,
    toStartOfDay(CreatedAt) AS Day,
    AppVersion AS Value,
    count() AS Count
FROM sessions
WHERE (AppVersion != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
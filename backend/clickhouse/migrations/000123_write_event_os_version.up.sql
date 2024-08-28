CREATE MATERIALIZED VIEW IF NOT EXISTS event_os_version_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'os_version' AS Key,
    toStartOfDay(CreatedAt) AS Day,
    OSVersion AS Value,
    count() AS Count
FROM sessions FINAL
WHERE (OSVersion != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS event_session_fields_new_mv TO event_key_values_new (
    `ProjectId` Int32,
    `Event` String,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    '' AS Event,
    Name AS Key,
    toStartOfDay(SessionCreatedAt) AS Day,
    Value AS Value,
    count() AS Count
FROM fields
WHERE (
    Name in (
        'browser_name',
        'browser_version',
        'city',
        'country',
        'environment',
        'identifier',
        'ip',
        'os_name',
        'os_version',
        'secure_session_id',
        'service_version'
    )
)
GROUP BY ProjectId,
    Event,
    Key,
    Day,
    Value;
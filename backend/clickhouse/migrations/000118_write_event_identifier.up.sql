CREATE MATERIALIZED VIEW IF NOT EXISTS event_identifier_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'identifier' AS Key,
    toStartOfDay(Timestamp) AS Day,
    Identifier AS Value,
    count() AS Count
FROM sessions
WHERE (Identifier != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS event_event_name_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'event' AS Key,
    toStartOfDay(Timestamp) AS Day,
    Event AS Value,
    count() AS Count
FROM session_events
WHERE (Event != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS event_event_name_new_mv TO event_key_values_new (
    `ProjectId` Int32,
    `Event` String,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    Event,
    'event' AS Key,
    toStartOfDay(Timestamp) AS Day,
    Event AS Value,
    count() AS Count
FROM session_events
WHERE (Event != '')
GROUP BY ProjectId,
    Event,
    Key,
    Day,
    Value;
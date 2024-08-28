CREATE MATERIALIZED VIEW IF NOT EXISTS event_state_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'state' AS Key,
    toStartOfDay(CreatedAt) AS Day,
    State AS Value,
    count() AS Count
FROM sessions
WHERE (State != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
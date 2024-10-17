CREATE TABLE IF NOT EXISTS event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day, Value);

CREATE TABLE IF NOT EXISTS event_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64,
    `Type` String
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day);

CREATE MATERIALIZED VIEW IF NOT EXISTS event_keys_mv TO event_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Type` LowCardinality(String),
    `Count` UInt64
) AS
SELECT ProjectId,
    Key,
    Day,
    if(
        isNull(toFloat64OrNull(Value)),
        'String',
        'Numeric'
    ) AS Type,
    sum(Count) AS Count
FROM event_key_values
GROUP BY ProjectId,
    Key,
    Day,
    Type;

CREATE MATERIALIZED VIEW IF NOT EXISTS event_attributes_mv TO event_key_values (
    `ProjectId` UInt32,
    `Key` String,
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID AS ProjectId,
    arrayJoin(Attributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(Attributes).2 AS Value,
    count() AS Count
FROM session_events
WHERE (
        Key NOT IN (
            'browser_name',
            'browser_version',
            'city',
            'country',
            'environment',
            'event',
            'first_session',
            'identified',
            'identifier',
            'ip',
            'os_name',
            'os_version',
            'secure_session_id',
            'service_version',
            'session_active_length',
            'session_length',
            'session_pages_visited',
            'state'
        )
    )
    AND (Value != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;

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

CREATE MATERIALIZED VIEW IF NOT EXISTS event_session_fields_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
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
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS event_attributes_mv TO event_key_values (
    `ProjectId` UInt32,
    `Key` String,
    `Day` DateTime,
    `Value` String
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    arrayJoin(Attributes).1 AS Key,
    Timestamp AS EventTimestamp,
    UUID AS EventUUID,
    arrayJoin(Attributes).2 AS Value
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
CREATE MATERIALIZED VIEW IF NOT EXISTS log_attributes_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    arrayJoin(LogAttributes).1 AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    arrayJoin(LogAttributes).2 AS Value
FROM logs
WHERE (
        Key NOT IN (
            'level',
            'secure_session_id',
            'service_name',
            'service_version',
            'source',
            'span_id',
            'trace_id',
            'message'
        )
    )
    AND (Value != '');
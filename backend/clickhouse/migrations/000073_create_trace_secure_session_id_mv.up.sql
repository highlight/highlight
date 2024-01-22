CREATE MATERIALIZED VIEW IF NOT EXISTS trace_secure_session_id_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'secure_session_id' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    SecureSessionId AS Value
FROM traces
WHERE (SecureSessionId != '');
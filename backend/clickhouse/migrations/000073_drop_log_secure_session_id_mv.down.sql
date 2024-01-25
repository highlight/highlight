CREATE MATERIALIZED VIEW IF NOT EXISTS log_secure_session_id_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'secure_session_id' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    SecureSessionId AS Value
FROM logs
WHERE (SecureSessionId != '');
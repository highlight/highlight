CREATE MATERIALIZED VIEW IF NOT EXISTS default.log_secure_session_id_mv TO default.log_attributes (
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
FROM default.logs
WHERE (SecureSessionId != '');
CREATE MATERIALIZED VIEW IF NOT EXISTS log_body_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'message' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    Body AS Value
FROM logs
WHERE (Body != '');
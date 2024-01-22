CREATE MATERIALIZED VIEW IF NOT EXISTS log_environment_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'environment' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    Environment AS Value
FROM logs
WHERE (Environment != '');
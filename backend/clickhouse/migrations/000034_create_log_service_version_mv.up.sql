CREATE MATERIALIZED VIEW IF NOT EXISTS log_service_version_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'service_version' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    ServiceVersion AS Value
FROM logs
WHERE (ServiceVersion != '');
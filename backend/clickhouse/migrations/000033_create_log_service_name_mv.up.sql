CREATE MATERIALIZED VIEW IF NOT EXISTS log_service_name_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'service_name' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    ServiceName AS Value
FROM logs
WHERE (ServiceName != '');
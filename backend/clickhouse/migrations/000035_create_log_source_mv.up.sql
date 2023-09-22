CREATE MATERIALIZED VIEW IF NOT EXISTS log_source_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'source' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    Source AS Value
FROM logs
WHERE (Source != '')
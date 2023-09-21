CREATE MATERIALIZED VIEW IF NOT EXISTS default.log_source_mv TO default.log_attributes (
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
FROM default.logs
WHERE (Source != '')
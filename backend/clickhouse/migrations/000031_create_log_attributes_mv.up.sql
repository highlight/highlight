CREATE MATERIALIZED VIEW IF NOT EXISTS default.log_attributes_mv TO default.log_attributes (
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
FROM default.logs
WHERE (Value != '');
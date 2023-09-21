CREATE MATERIALIZED VIEW IF NOT EXISTS default.log_trace_id_mv TO default.log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'trace_id' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    TraceId AS Value
FROM default.logs
WHERE (TraceId != '');
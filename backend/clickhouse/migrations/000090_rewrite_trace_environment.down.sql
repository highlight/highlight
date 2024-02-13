DROP VIEW IF EXISTS trace_environment_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_environment_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'environment' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    Environment AS Value
FROM traces
WHERE (Environment != '');
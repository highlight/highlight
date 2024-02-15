DROP VIEW IF EXISTS trace_has_errors_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_has_errors_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'has_errors' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    HasErrors AS Value
FROM traces
WHERE HasErrors IS NOT NULL;
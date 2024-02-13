DROP VIEW IF EXISTS trace_state_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_state_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'trace_state' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    TraceState AS Value
FROM traces
WHERE (TraceState != '');
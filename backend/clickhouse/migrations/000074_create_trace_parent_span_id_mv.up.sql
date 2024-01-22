CREATE MATERIALIZED VIEW IF NOT EXISTS trace_parent_span_id_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'parent_span_id' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    ParentSpanId AS Value
FROM traces
WHERE (ParentSpanId != '');
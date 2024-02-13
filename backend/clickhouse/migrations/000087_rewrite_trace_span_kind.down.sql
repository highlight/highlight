DROP VIEW IF EXISTS trace_span_kind_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_span_kind_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'span_kind' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    SpanKind AS Value
FROM traces
WHERE (SpanKind != '');
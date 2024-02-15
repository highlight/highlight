DROP VIEW IF EXISTS trace_attributes_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_attributes_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    arrayJoin(TraceAttributes).1 AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    arrayJoin(TraceAttributes).2 AS Value
FROM traces
WHERE (
        Key NOT IN (
            'level',
            'trace_state',
            'span_name',
            'span_kind',
            'service_name',
            'service_version',
            'message',
            'secure_session_id',
            'span_id',
            'trace_id',
            'parent_span_id',
            'duration'
        )
    )
    AND (Value != '');
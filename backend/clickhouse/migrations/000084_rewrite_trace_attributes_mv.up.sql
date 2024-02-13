DROP VIEW IF EXISTS trace_attributes_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(TraceAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(TraceAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE (
        Key NOT IN (
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
    AND (Value != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
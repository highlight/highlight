DROP VIEW IF EXISTS trace_span_kind_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_span_kind_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    'span_kind' AS Key,
    toStartOfDay(Timestamp) AS Day,
    SpanKind AS Value,
    count() AS Count
FROM traces
WHERE (SpanKind != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
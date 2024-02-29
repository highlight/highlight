DROP VIEW IF EXISTS trace_span_name_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_span_name_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    'span_name' AS Key,
    toStartOfDay(Timestamp) AS Day,
    SpanName AS Value,
    count() AS Count
FROM traces
WHERE (SpanName != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
DROP VIEW IF EXISTS trace_state_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_state_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    'trace_state' AS Key,
    toStartOfDay(Timestamp) AS Day,
    TraceState AS Value,
    count() AS Count
FROM traces
WHERE (TraceState != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
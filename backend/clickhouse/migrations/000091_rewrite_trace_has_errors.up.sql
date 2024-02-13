DROP VIEW IF EXISTS trace_has_errors_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_has_errors_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    'has_errors' AS Key,
    toStartOfDay(Timestamp) AS Day,
    HasErrors AS Value,
    count() AS Count
FROM traces
WHERE HasErrors IS NOT NULL
GROUP BY ProjectId,
    Key,
    Day,
    Value;
DROP VIEW IF EXISTS trace_environment_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_environment_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    'environment' AS Key,
    toStartOfDay(Timestamp) AS Day,
    Environment AS Value,
    count() AS Count
FROM traces
WHERE (Environment != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
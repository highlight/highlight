DROP VIEW IF EXISTS trace_service_version_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_service_version_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    'service_version' AS Key,
    toStartOfDay(Timestamp) AS Day,
    ServiceVersion AS Value,
    count() AS Count
FROM traces
WHERE (ServiceVersion != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
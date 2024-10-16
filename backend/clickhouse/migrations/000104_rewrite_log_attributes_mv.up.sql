DROP VIEW IF EXISTS log_attributes_mv;
CREATE MATERIALIZED VIEW log_attributes_mv TO log_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(LogAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(LogAttributes).2 AS Value,
    count() AS Count
FROM logs
WHERE (
        Key NOT IN (
            'level',
            'secure_session_id',
            'service_name',
            'service_version',
            'source',
            'span_id',
            'trace_id',
            'message'
        )
    )
    AND (Value != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
DROP VIEW IF EXISTS log_service_name_mv;
CREATE MATERIALIZED VIEW log_service_name_mv TO log_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    'service_name' AS Key,
    toStartOfDay(Timestamp) AS Day,
    ServiceName AS Value,
    count() AS Count
FROM logs
WHERE (ServiceName != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
DROP VIEW IF EXISTS log_service_version_mv;
CREATE MATERIALIZED VIEW log_service_version_mv TO log_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    'service_version' AS Key,
    toStartOfDay(Timestamp) AS Day,
    ServiceVersion AS Value,
    count() AS Count
FROM logs
WHERE (ServiceVersion != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
DROP VIEW IF EXISTS log_source_mv;
CREATE MATERIALIZED VIEW log_source_mv TO log_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    'source' AS Key,
    toStartOfDay(Timestamp) AS Day,
    Source AS Value,
    count() AS Count
FROM logs
WHERE (Source != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
DROP VIEW IF EXISTS log_severity_text_mv;
CREATE MATERIALIZED VIEW log_severity_text_mv TO log_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    'level' AS Key,
    toStartOfDay(Timestamp) AS Day,
    SeverityText AS Value,
    count() AS Count
FROM logs
WHERE (SeverityText != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
DROP VIEW IF EXISTS log_environment_mv;
CREATE MATERIALIZED VIEW log_environment_mv TO log_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId AS ProjectId,
    'environment' AS Key,
    toStartOfDay(Timestamp) AS Day,
    Environment AS Value,
    count() AS Count
FROM logs
WHERE (Environment != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;
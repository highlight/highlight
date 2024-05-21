DROP VIEW IF EXISTS log_attributes_mv;
CREATE MATERIALIZED VIEW log_attributes_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    arrayJoin(LogAttributes).1 AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    arrayJoin(LogAttributes).2 AS Value
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
    AND (Value != '');
DROP VIEW IF EXISTS log_service_name_mv;
CREATE MATERIALIZED VIEW log_service_name_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'service_name' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    ServiceName AS Value
FROM logs
WHERE (ServiceName != '');
DROP VIEW IF EXISTS log_service_version_mv;
CREATE MATERIALIZED VIEW log_service_version_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'service_version' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    ServiceVersion AS Value
FROM logs
WHERE (ServiceVersion != '');
DROP VIEW IF EXISTS log_source_mv;
CREATE MATERIALIZED VIEW log_source_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'source' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    Source AS Value
FROM logs
WHERE (Source != '');
DROP VIEW IF EXISTS log_severity_text_mv;
CREATE MATERIALIZED VIEW log_severity_text_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'level' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    SeverityText AS Value
FROM logs
WHERE (SeverityText != '');
DROP VIEW IF EXISTS log_environment_mv;
CREATE MATERIALIZED VIEW log_environment_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'environment' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    Environment AS Value
FROM logs
WHERE (Environment != '');
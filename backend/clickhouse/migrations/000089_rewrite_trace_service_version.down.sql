DROP VIEW IF EXISTS trace_service_version_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_service_version_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'service_version' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    ServiceVersion AS Value
FROM traces
WHERE (ServiceVersion != '');
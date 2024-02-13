DROP VIEW IF EXISTS trace_service_name_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_service_name_mv TO trace_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'service_name' AS Key,
    Timestamp AS TraceTimestamp,
    UUID AS TraceUUID,
    ServiceName AS Value
FROM traces
WHERE (ServiceName != '');
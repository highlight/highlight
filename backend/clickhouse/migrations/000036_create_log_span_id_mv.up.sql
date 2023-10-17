CREATE MATERIALIZED VIEW IF NOT EXISTS log_span_id_mv TO log_attributes (
    `ProjectId` UInt32,
    `Key` String,
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) AS
SELECT ProjectId AS ProjectId,
    'span_id' AS Key,
    Timestamp AS LogTimestamp,
    UUID AS LogUUID,
    SpanId AS Value
FROM logs
WHERE (SpanId != '');
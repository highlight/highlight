CREATE MATERIALIZED VIEW IF NOT EXISTS log_severity_text_mv TO log_attributes (
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
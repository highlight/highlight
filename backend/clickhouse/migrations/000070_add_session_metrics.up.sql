CREATE TABLE IF NOT EXISTS session_metrics (
    `ProjectId` Int32,
    `SecureSessionId` String,
    `Name` String,
    `Value` Float64,
    `Timestamp` DateTime64(9)
) ENGINE = MergeTree
ORDER BY (ProjectId, SecureSessionId);
CREATE MATERIALIZED VIEW IF NOT EXISTS session_metrics_mv TO session_metrics (
    `ProjectId` Int32,
    `SecureSessionId` String,
    `Name` String,
    `Value` Float64,
    `Timestamp` DateTime64(9)
) AS
SELECT ProjectId,
    SecureSessionId,
    Events.Attributes [1] ['metric.name'] AS Name,
    toFloat64OrNull(Events.Attributes [1] ['metric.value']) AS Value,
    Timestamp
FROM traces
WHERE SpanName = 'highlight-metric'
    AND SecureSessionId <> ''
    AND Name is not null
    AND Value is not null;
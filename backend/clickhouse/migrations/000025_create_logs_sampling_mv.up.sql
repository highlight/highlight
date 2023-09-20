CREATE MATERIALIZED VIEW logs_sampling_mv TO logs_sampling (
    `Timestamp` DateTime,
    `UUID` UUID,
    `TraceId` String,
    `SpanId` String,
    `TraceFlags` UInt32,
    `SeverityText` LowCardinality(String),
    `SeverityNumber` Int32,
    `ServiceName` LowCardinality(String),
    `Body` String,
    `LogAttributes` Map(LowCardinality(String), String),
    `ProjectId` UInt32,
    `SecureSessionId` String,
    `Source` String,
    `ServiceVersion` String
) AS
SELECT *
FROM logs;
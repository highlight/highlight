CREATE TABLE IF NOT EXISTS logs_new_ts (
    `Timestamp` DateTime64(9),
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
    `ServiceVersion` String,
    `Environment` String,
    INDEX idx_trace_id TraceId TYPE bloom_filter GRANULARITY 1,
    INDEX idx_secure_session_id SecureSessionId TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree PARTITION BY toDate(Timestamp)
ORDER BY (ProjectId, Timestamp, UUID) TTL toDateTime(Timestamp) + toIntervalDay(30) SETTINGS ttl_only_drop_parts = 1,
    index_granularity = 8192,
    allow_experimental_block_number_column = 1;
CREATE MATERIALIZED VIEW IF NOT EXISTS logs_new_ts_mv TO logs_new_ts AS
SELECT *
FROM logs;
EXCHANGE TABLES logs
AND logs_new_ts;
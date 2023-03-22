CREATE TABLE IF NOT EXISTS logs_new
(
    Timestamp          DateTime,
    UUID               UUID,
    TraceId            String,
    SpanId             String,
    TraceFlags         UInt32,
    SeverityText       LowCardinality(String),
    SeverityNumber     Int32,
    ServiceName        LowCardinality(String),
    Body               String,
    LogAttributes      Map(LowCardinality(String), String),
    ProjectId          UInt32,
    SecureSessionId    String,
    INDEX idx_trace_id          TraceId TYPE bloom_filter GRANULARITY 1,
    INDEX idx_secure_session_id SecureSessionId TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_key      mapKeys(LogAttributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_value    mapValues(LogAttributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_body              Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
    ENGINE = MergeTree
        PARTITION BY toDate(Timestamp)
        ORDER BY (ProjectId, Timestamp, UUID)
        TTL Timestamp + toIntervalDay(30)
        SETTINGS ttl_only_drop_parts = 1;
CREATE TABLE logs
(
    Timestamp          DateTime64(9) CODEC (Delta, ZSTD(1)),
    UUID               UUID CODEC (ZSTD(1)),
    TraceId            String CODEC (ZSTD(1)),
    SpanId             String CODEC (ZSTD(1)),
    TraceFlags         UInt32 CODEC (ZSTD(1)),
    SeverityText       LowCardinality(String) CODEC (ZSTD(1)),
    SeverityNumber     Int32 CODEC (ZSTD(1)),
    ServiceName        LowCardinality(String) CODEC (ZSTD(1)),
    Body               String CODEC (ZSTD(1)),
    LogAttributes      Map(LowCardinality(String), String) CODEC (ZSTD(1)),
    ProjectId          UInt32 CODEC (ZSTD(1)),
    SecureSessionId    String CODEC (ZSTD(1)),
    INDEX idx_trace_id          TraceId TYPE bloom_filter GRANULARITY 1,
    INDEX idx_secure_session_id SecureSessionId TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_key      mapKeys(LogAttributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_value    mapValues(LogAttributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_body              Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
    ENGINE = MergeTree
        PARTITION BY toDate(Timestamp)
        ORDER BY (ProjectId, toUnixTimestamp(Timestamp), UUID)
        TTL toDateTime(Timestamp) + toIntervalDay(30)
        SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
CREATE TABLE IF NOT EXISTS traces
(
    Timestamp DateTime,
    UUID UUID,
    TraceId String,
    SpanId String,
    ParentSpanId String,
    ProjectId UInt32,
    SecureSessionId String,
    TraceState String,
    SpanName LowCardinality(String),
    SpanKind LowCardinality(String),
    Duration Int64,
    ServiceName LowCardinality(String),
    ServiceVersion String,
    TraceAttributes Map(LowCardinality(String), String),
    StatusCode LowCardinality(String),
    StatusMessage String,
    Events Nested (
        Timestamp DateTime,
        Name LowCardinality(String),
        Attributes Map(LowCardinality(String), String)
    ),
    Links Nested (
        TraceId String,
        SpanId String,
        TraceState String,
        Attributes Map(LowCardinality(String), String)
    ),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(TraceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(TraceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
    ENGINE = MergeTree
        ORDER BY (ProjectId, Timestamp, UUID)
        TTL toDateTime(Timestamp) + toIntervalDay(30)
        SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;

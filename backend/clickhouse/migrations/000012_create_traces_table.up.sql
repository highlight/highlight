CREATE TABLE IF NOT EXISTS traces
(
    ProjectId UInt32,
    SecureSessionId String,
    Timestamp DateTime,
    TraceId String,
    SpanId String,
    ParentSpanId String,
    TraceState String,
    SpanName LowCardinality(String),
    SpanKind LowCardinality(String),
    Duration Int64,
    ServiceName LowCardinality(String),
    ResourceAttributes Map(LowCardinality(String), String),
    SpanAttributes Map(LowCardinality(String), String),
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
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
    ENGINE = MergeTree
        PARTITION BY toDate(Timestamp)
        ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
        SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;

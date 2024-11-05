-- Default Sum metrics table DDL
CREATE TABLE IF NOT EXISTS metrics (
    ProjectID UInt32,
    ServiceName LowCardinality(String),
    MetricName String,
    MetricDescription String,
    MetricUnit String,
    Attributes Map(LowCardinality(String), String),
	StartTimestamp DateTime64(9) CODEC(Delta, ZSTD),
	Timestamp DateTime64(9) CODEC(Delta, ZSTD),
	RetentionDays UInt8 DEFAULT 30,
    -- common
    Flags UInt32 ,
    Exemplars Nested (
        Attributes Map(LowCardinality(String), String),
        Timestamp DateTime64(9),
        Value Float64,
        SpanID String,
        TraceID String,
        SecureSessionID String
    ),
    -- https://github.com/open-telemetry/opentelemetry-collector/blob/fee2daa249acdedddb6a4002875ef5f0c40fde12/pdata/pmetric/metric_type.go#L9-L17
    Type Enum8('Empty' = 0, 'Gauge' = 1, 'Sum' = 2, 'Histogram' = 3, 'ExponentialHistogram' = 4, 'Summary' = 5),
	-- sum
    Value Float64,
    -- histogram
    Count UInt64 CODEC(Delta, ZSTD),
    Sum Float64,
    BucketCounts Array(UInt64),
    ExplicitBounds Array(Float64),
    Min Float64,
    Max Float64,
    -- summary
    ValueAtQuantiles Nested(
        Quantile Float64,
        Value Float64
    ),
	INDEX idx_attr_key mapKeys(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_attr_value mapValues(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree()
TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays)
PARTITION BY toDate(Timestamp)
ORDER BY (ProjectID, toUnixTimestamp64Nano(Timestamp), ServiceName, MetricName, Attributes)
SETTINGS index_granularity = 8192,
    min_rows_for_wide_part = 0,
    min_bytes_for_wide_part = 0,
    ttl_only_drop_parts = 1,
    min_bytes_for_full_part_storage = 4294967296,
    max_bytes_to_merge_at_min_space_in_pool = 10485760,
    number_of_free_entries_in_pool_to_lower_max_size_of_merge = 6;

-- Default Sum metrics table DDL
CREATE TABLE IF NOT EXISTS metrics_sum (
    ProjectId UInt32,
    ResourceAttributes Map(LowCardinality(String), String),
    ScopeName String,
    ScopeVersion String,
    ScopeAttributes Map(LowCardinality(String), String),
    ScopeDroppedAttrCount UInt32,
    ServiceName LowCardinality(String),
    MetricName String,
    MetricDescription String,
    MetricUnit String,
    Attributes Map(LowCardinality(String), String),
	StartTimestamp DateTime64(9),
	Timestamp DateTime64(9),
	Value Float64,
	Flags UInt32 ,
    Exemplars Nested (
		FilteredAttributes Map(LowCardinality(String), String),
		Timestamp DateTime64(9),
		Value Float64,
		SpanId String,
		TraceId String
    ),
    AggregationTemporality Int32,
	IsMonotonic Boolean,
	INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_attr_key mapKeys(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_attr_value mapValues(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree()
TTL toDateTime("Timestamp") + toIntervalDay(180)
PARTITION BY toDate(Timestamp)
ORDER BY (ProjectId, ServiceName, MetricName, Attributes, toUnixTimestamp64Nano(Timestamp))
SETTINGS index_granularity = 8192,
    min_rows_for_wide_part = 0,
    min_bytes_for_wide_part = 0,
    ttl_only_drop_parts = 1,
    min_bytes_for_full_part_storage = 4294967296,
    max_bytes_to_merge_at_min_space_in_pool = 10485760,
    number_of_free_entries_in_pool_to_lower_max_size_of_merge = 6;

-- Default Histogram metrics table DDL
CREATE TABLE IF NOT EXISTS metrics_histogram (
    ProjectId UInt32,
    ResourceAttributes Map(LowCardinality(String), String),
    ScopeName String,
    ScopeVersion String,
    ScopeAttributes Map(LowCardinality(String), String),
    ScopeDroppedAttrCount UInt32,
    ServiceName LowCardinality(String),
    MetricName String,
    MetricDescription String,
    MetricUnit String,
    Attributes Map(LowCardinality(String), String),
	StartTimestamp DateTime64(9),
	Timestamp DateTime64(9),
    Count UInt64,
    Sum Float64,
    BucketCounts Array(UInt64),
    ExplicitBounds Array(Float64),
	Exemplars Nested (
		FilteredAttributes Map(LowCardinality(String), String),
		Timestamp DateTime64(9),
		Value Float64,
		SpanId String,
		TraceId String
    ),
    Flags UInt32,
    Min Float64,
    Max Float64,
    AggregationTemporality Int32,
	INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_attr_key mapKeys(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_attr_value mapValues(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree()
TTL toDateTime("Timestamp") + toIntervalDay(180)
PARTITION BY toDate(Timestamp)
ORDER BY (ProjectId, ServiceName, MetricName, Attributes, toUnixTimestamp64Nano(Timestamp))
SETTINGS index_granularity = 8192,
    min_rows_for_wide_part = 0,
    min_bytes_for_wide_part = 0,
    ttl_only_drop_parts = 1,
    min_bytes_for_full_part_storage = 4294967296,
    max_bytes_to_merge_at_min_space_in_pool = 10485760,
    number_of_free_entries_in_pool_to_lower_max_size_of_merge = 6;

-- Default Summary metrics DDL
CREATE TABLE IF NOT EXISTS metrics_summary (
    ProjectId UInt32,
    ResourceAttributes Map(LowCardinality(String), String),
    ScopeName String,
    ScopeVersion String,
    ScopeAttributes Map(LowCardinality(String), String),
    ScopeDroppedAttrCount UInt32,
    ServiceName LowCardinality(String),
    MetricName String,
    MetricDescription String,
    MetricUnit String,
    Attributes Map(LowCardinality(String), String),
	StartTimestamp DateTime64(9),
	Timestamp DateTime64(9),
    Count UInt64,
    Sum Float64,
    ValueAtQuantiles Nested(
		Quantile Float64,
		Value Float64
	),
    Flags UInt32 ,
	INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_attr_key mapKeys(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_attr_value mapValues(Attributes) TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree()
TTL toDateTime("Timestamp") + toIntervalDay(180)
PARTITION BY toDate(Timestamp)
ORDER BY (ProjectId, ServiceName, MetricName, Attributes, toUnixTimestamp64Nano(Timestamp))
SETTINGS index_granularity = 8192,
    min_rows_for_wide_part = 0,
    min_bytes_for_wide_part = 0,
    ttl_only_drop_parts = 1,
    min_bytes_for_full_part_storage = 4294967296,
    max_bytes_to_merge_at_min_space_in_pool = 10485760,
    number_of_free_entries_in_pool_to_lower_max_size_of_merge = 6;

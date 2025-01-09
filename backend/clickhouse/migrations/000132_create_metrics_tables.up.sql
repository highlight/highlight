CREATE TABLE IF NOT EXISTS metrics_sum
(
    ProjectId              UInt32,
    ServiceName            LowCardinality(String),
    MetricName             String,
    MetricDescription      String,
    MetricUnit             String,
    Attributes             Map(LowCardinality(String), String),
    StartTimestamp         DateTime64(9) CODEC (Delta, ZSTD),
    Timestamp              DateTime64(9) CODEC (Delta, ZSTD),
    RetentionDays          UInt8 DEFAULT 30,
    -- common
    Type                   Enum8('Empty' = 0, 'Gauge' = 1, 'Sum' = 2, 'Histogram' = 3, 'ExponentialHistogram' = 4, 'Summary' = 5),
    Flags                  UInt32,
    Exemplars              Nested(Attributes Map(LowCardinality(String), String),
                               Timestamp DateTime64(9),
                               Value Float64,
                               SpanID String,
                               TraceID String,
                               SecureSessionID String),
    -- sum
    Value                  Float64,
    AggregationTemporality Int32 CODEC (ZSTD(1)),
    IsMonotonic            Boolean CODEC (Delta, ZSTD(1))
) ENGINE = MergeTree()
      TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays)
      PARTITION BY toStartOfDay(Timestamp)
      ORDER BY (ProjectId, ServiceName, MetricName, toUnixTimestamp64Nano(Timestamp))
      SETTINGS min_rows_for_wide_part = 0,
          min_bytes_for_wide_part = 0,
          ttl_only_drop_parts = 1,
          min_bytes_for_full_part_storage = 4294967296,
          max_bytes_to_merge_at_min_space_in_pool = 10485760,
          number_of_free_entries_in_pool_to_lower_max_size_of_merge = 6;

CREATE TABLE IF NOT EXISTS metrics_histogram
(
    ProjectId              UInt32,
    ServiceName            LowCardinality(String),
    MetricName             String,
    MetricDescription      String,
    MetricUnit             String,
    Attributes             Map(LowCardinality(String), String),
    StartTimestamp         DateTime64(9) CODEC (Delta, ZSTD),
    Timestamp              DateTime64(9) CODEC (Delta, ZSTD),
    RetentionDays          UInt8 DEFAULT 30,
    -- common
    Flags                  UInt32,
    Exemplars              Nested(Attributes Map(LowCardinality(String), String),
                               Timestamp DateTime64(9),
                               Value Float64,
                               SpanID String,
                               TraceID String,
                               SecureSessionID String),
    -- histogram
    Count                  UInt64 CODEC (Delta, ZSTD),
    Sum                    Float64,
    BucketCounts           Array(UInt64),
    ExplicitBounds         Array(Float64),
    Min                    Float64,
    Max                    Float64,
    AggregationTemporality Int32 CODEC (ZSTD(1))
) ENGINE = MergeTree()
      TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays)
      PARTITION BY toStartOfDay(Timestamp)
      ORDER BY (ProjectId, ServiceName, MetricName, toUnixTimestamp64Nano(Timestamp))
      SETTINGS min_rows_for_wide_part = 0,
          min_bytes_for_wide_part = 0,
          ttl_only_drop_parts = 1,
          min_bytes_for_full_part_storage = 4294967296,
          max_bytes_to_merge_at_min_space_in_pool = 10485760,
          number_of_free_entries_in_pool_to_lower_max_size_of_merge = 6;


CREATE TABLE IF NOT EXISTS metrics_summary
(
    ProjectId         UInt32,
    ServiceName       LowCardinality(String),
    MetricName        String,
    MetricDescription String,
    MetricUnit        String,
    Attributes        Map(LowCardinality(String), String),
    StartTimestamp    DateTime64(9) CODEC (Delta, ZSTD),
    Timestamp         DateTime64(9) CODEC (Delta, ZSTD),
    RetentionDays     UInt8 DEFAULT 30,
    -- common
    Flags             UInt32,
    -- summary
    Count             Float64,
    Sum               Float64,
    ValueAtQuantiles  Nested(Quantile Float64, Value Float64)
) ENGINE = MergeTree()
      TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays)
      PARTITION BY toStartOfDay(Timestamp)
      ORDER BY (ProjectId, ServiceName, MetricName, toUnixTimestamp64Nano(Timestamp))
      SETTINGS min_rows_for_wide_part = 0,
          min_bytes_for_wide_part = 0,
          ttl_only_drop_parts = 1,
          min_bytes_for_full_part_storage = 4294967296,
          max_bytes_to_merge_at_min_space_in_pool = 10485760,
          number_of_free_entries_in_pool_to_lower_max_size_of_merge = 6;

---
title: "Ingest and Visualization for OpenTelemetry Metrics"
createdAt: 2025-01-23T12:00:00Z
readingTime: 14
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: 'https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c'
tags: 'Developer Tooling, Monitoring, Observability'
metaTitle: 'Building an Efficient OpenTelemetry Metrics Schema in Clickhouse'
---

```hint
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. If you’re interested in learning more, get started at [highlight.io](https://highlight.io).
```

## OpenTelemetry Metrics

OpenTelemetry (OTeL) is becoming the de facto standard for observability, providing a unified way to collect, process,
and export telemetry data, including traces, logs, and metrics. While traces and logs are crucial for debugging, metrics
offer a high-level view of system performance and health. Efficiently storing and querying these metrics is essential
for real-time insights, and ClickHouse—a high-performance, columnar database—provides an ideal backend for scalable and
cost-effective metric ingestion.

At Highlight, we recently introduced support for OTeL metrics ingest. Below, we’ll describe how we structured the
implementation to deliver an efficient OpenTelemetry metrics pipeline using ClickHouse, covering ingestion, aggregation,
querying, and visualization.

### OTeL Metrics Formats

OpenTelemetry metrics are designed to be flexible, supporting various aggregation and encoding formats. The key formats
include:
• Gauge: Represents a single numerical value that changes over time, such as CPU usage or memory consumption.
• Counter: A monotonically increasing value, commonly used for request counts or error rates.
• Histogram: Captures the distribution of values over a given time period, useful for tracking request latencies.
• Summary: Similar to histograms but includes percentile calculations for more detailed insights.

The OTel protocol transmits these metric types in a structured format, typically in protobuf or JSON when using OTLP (
OpenTelemetry Protocol). Understanding these formats is crucial for designing an efficient ingestion pipeline that
minimizes storage overhead while maximizing query performance.

## Building an Ingest Path

Highlight uses [Apache Kafka to buffer data]((./scalable-data-processing-with-apache-kafka.md)) for bulk inserts into
ClickHouse. While we use the OpenTelemetry collector to receive, deserialize, and batch data, we export to our Golang
API that mutates the data before writing to Apache Kafka. A set of workers (the Apache Kafka Connect ClickHouse
exporter) read the data and write it to ClickHouse in large batches.

```text
            +------------------+
            |  OTel Collector  |
            +------------------+
                    |
                    v
            +------------------+
            |   Highlight API  |
            +------------------+
                    |
                    v
            +------------------+
            |   Apache Kafka   |
            +------------------+
                    |
         +----------------------+
         |     Kafka Connect    |
         +----------------------+
                    |
                    v
           +------------------+
           |    ClickHouse    |
           +------------------+
```

### OpenTelemetry Collector Setup

The OpenTelemetry Collector is a key component in an OTel pipeline, responsible for receiving, processing, and exporting
telemetry data. For metric ingestion into ClickHouse, we configure the collector to receive OTel metrics via the OTLP
receiver, process them using built-in processors (e.g., batch and transform), and export them to our API.

Here’s an example OpenTelemetry Collector configuration for exporting metrics to our Highlight API which then batch
exports data to ClickHouse:

```yaml
receivers:
  awsfirehose/cwmetrics:
    record_type: cwmetrics
  awsfirehose/otlp_v1:
    record_type: otlp_v1
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:
    timeout: 5s
    send_batch_size: 1000

exporters:
  otlphttp:
    endpoint: 'http://pub.prod.vpc.highlight.io:8082/otel'

service:
  pipelines:
    metrics:
      receivers: [ otlp, awsfirehose/cwmetrics, awsfirehose/otlp_v1 ]
      processors: [ batch ]
      exporters: [ otlphttp ]
```

See our full production OpenTelemetry
collector [config here](https://github.com/highlight/highlight/blob/bb84dab01aab4ec223632814b244e3381e074b26/deploy/otel-collector.yaml).

If you are building an OpenTelemetry pipeline from scratch, you can use the `clickhouse` collector export for direct
writes to the database. For our production use-case, we route the data through our API for pre-processing and write
buffering via Apache Kafka, but you may find success with the exporter even for large volumes.

```yaml
exporters:
  clickhouse:
    endpoint: "tcp://clickhouse-server:9000"
    database: "otel_metrics"
    username: "default"
    password: ""
```

By using the OpenTelemetry collector as the initial entrypoint for the data, we get the benefit of the collector supporting myriad receivers which can be compatible with different data formats.
For instance, as shown in the example above, we also set up a receiver for the AWS Firehose CloudWatch metrics format in the same collector. We'll be covering cloud integrations in a future blog post, stay tuned!

## Aggregating and Reducing Data Granularity

High-cardinality metrics can quickly balloon in storage size, making efficient aggregation crucial. ClickHouse provides
materialized views and TTL-based rollups to downsample data while retaining aggregate insights.

Our production data pipeline initially writes the metrics in their OTeL native format to [one of three tables](https://github.com/highlight/highlight/blob/0374e166783956bf6b0eae8133250a52527873d0/backend/clickhouse/migrations/000132_create_metrics_tables.up.sql). Metrics are written to one of the `metrics_sum`, `metrics_histogram`, and `metrics_summary` tables. 

The frequency of metric data can be a challenge with querying over wide time-ranges. While the OpenTelemetry SDK emitting the metrics may aggregate data, the collector does not perform any additional aggregation. 

A real-world example: imagine having a 100-node Kubernetes cluster running your application. Each application instance is receiving many requests per second and emitting a number of latency metrics for each API endpoint. Even if the OTeL SDK is configured to aggregate metrics down to each second, each node will still produce one row per second for each of the unique metrics and their attributes. Any unique tags emitted on the metrics will result in unique metric rows written to ClickHouse. On top of that, the 100 nodes will all be sending their respective data which will not be aggregated by the Collector. The result: writing thousands of rows per second to ClickHouse with fine timestamp granularity.

Another reason to transform the data is to aggregate the different OTeL metrics formats into a cohesive one that's easier to query. We went with a an approach that solves both problems, aggregating metric values to 1-second resolution and merging data between the metrics formats. 

Below you'll find the schema we adopted for each OTeL metric type along with the materialized views that perform aggregations:

```sql

CREATE TABLE IF NOT EXISTS metrics_sum
(
    ProjectId         UInt32,
    ServiceName       LowCardinality(String),
    MetricName        String,
    MetricDescription String,
    MetricUnit        String,
    Attributes        Map(LowCardinality(String), String),
    Timestamp         DateTime64(9) CODEC (Delta, ZSTD),
    RetentionDays     UInt8 DEFAULT 30,
    -- sum
    Value             Float64
    -- other columns omitted for brevity
) ENGINE = MergeTree()
      TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays)
      PARTITION BY toStartOfDay(Timestamp)
      ORDER BY (ProjectId, ServiceName, MetricName, toUnixTimestamp64Nano(Timestamp));

CREATE TABLE IF NOT EXISTS metrics_histogram
(
    ProjectId         UInt32,
    ServiceName       LowCardinality(String),
    MetricName        String,
    MetricDescription String,
    MetricUnit        String,
    Attributes        Map(LowCardinality(String), String),
    Timestamp         DateTime64(9) CODEC (Delta, ZSTD),
    RetentionDays     UInt8 DEFAULT 30,
    -- common
    -- histogram
    Count             UInt64 CODEC (Delta, ZSTD),
    Sum               Float64,
    BucketCounts Array (UInt64),
    ExplicitBounds Array (Float64),
    Min               Float64,
    Max               Float64
    -- other columns omitted for brevity
) ENGINE = MergeTree()
      TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays)
      PARTITION BY toStartOfDay(Timestamp)
      ORDER BY (ProjectId, ServiceName, MetricName, toUnixTimestamp64Nano(Timestamp));


CREATE TABLE IF NOT EXISTS metrics_summary
(
    ProjectId         UInt32,
    ServiceName       LowCardinality(String),
    MetricName        String,
    MetricDescription String,
    MetricUnit        String,
    Attributes        Map(LowCardinality(String), String),
    Timestamp         DateTime64(9) CODEC (Delta, ZSTD),
    RetentionDays     UInt8 DEFAULT 30,
    -- common
    Flags             UInt32,
    -- summary
    Count             Float64,
    Sum               Float64
    -- other columns omitted for brevity
) ENGINE = MergeTree()
      TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays)
      PARTITION BY toStartOfDay(Timestamp)
      ORDER BY (ProjectId, ServiceName, MetricName, toUnixTimestamp64Nano(Timestamp));

-- the destination table which contains the aggregate across metrics formats
CREATE TABLE IF NOT EXISTS default.metrics
(
    ProjectId         UInt32,
    ServiceName       String,
    MetricName        String,
    MetricType        Enum8('Empty' = 0, 'Gauge' = 1, 'Sum' = 2, 'Histogram' = 3, 'ExponentialHistogram' = 4, 'Summary' = 5),
    Attributes        Map(LowCardinality(String), String),
    Timestamp         DateTime CODEC (Delta(4), ZSTD(1)),
    -- meta
    MetricDescription SimpleAggregateFunction(anyLast, String),
    MetricUnit        SimpleAggregateFunction(anyLast, String),
    RetentionDays     SimpleAggregateFunction(max, UInt8) DEFAULT 30,
    -- histogram
    Min               SimpleAggregateFunction(min, Float64),
    Max               SimpleAggregateFunction(max, Float64),
    BucketCounts      SimpleAggregateFunction(groupArrayArray, Array(UInt64)),
    ExplicitBounds    SimpleAggregateFunction(groupArrayArray, Array(Float64)),
    -- common
    Count             SimpleAggregateFunction(sum, UInt64),
    Sum               SimpleAggregateFunction(sum, Float64)
    -- other columns omitted for brevity
) ENGINE = AggregatingMergeTree()
    PARTITION BY toStartOfDay(Timestamp)
    ORDER BY (ProjectId, ServiceName, MetricName, MetricType, toUnixTimestamp(Timestamp))
    TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);

CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_sum_mv TO metrics AS
SELECT ProjectId,
       ServiceName,
       MetricName,
       MetricType,
       Attributes,
       toDateTime(toStartOfSecond(Timestamp)) as Timestamp,
       -- meta
       anyLastSimpleState(MetricDescription)  as MetricDescription,
       anyLastSimpleState(MetricUnit)         as MetricUnit,
       minSimpleState(StartTimestamp)         as StartTimestamp,
       maxSimpleState(RetentionDays)          as RetentionDays,
       -- sum
       sumSimpleState(1)                      as Count,
       sumSimpleState(Value)                  as Sum
-- other columns omitted for brevity
FROM metrics_sum
GROUP BY all;

CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_histogram_mv TO metrics AS
SELECT ProjectId,
       ServiceName,
       MetricName,
       'Histogram'                                as MetricType,
       Attributes,
       toDateTime(toStartOfSecond(Timestamp))     as Timestamp,
       -- meta
       anyLastSimpleState(MetricDescription)      as MetricDescription,
       anyLastSimpleState(MetricUnit)             as MetricUnit,
       minSimpleState(StartTimestamp)             as StartTimestamp,
       maxSimpleState(RetentionDays)              as RetentionDays,
       -- histogram
       minSimpleState(Min)                        as Min,
       minSimpleState(Max)                        as Max,
       groupArrayArraySimpleState(BucketCounts)   as BucketCounts,
       groupArrayArraySimpleState(ExplicitBounds) as ExplicitBounds,
       sumSimpleState(Count)                      as Count,
       sumSimpleState(Sum)                        as Sum
-- other columns omitted for brevity
FROM metrics_histogram
GROUP BY all;

CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_summary_mv TO metrics AS
SELECT ProjectId,
       ServiceName,
       MetricName,
       'Summary'                              as MetricType,
       Attributes,
       toDateTime(toStartOfSecond(Timestamp)) as Timestamp,
       -- meta
       anyLastSimpleState(MetricDescription)  as MetricDescription,
       anyLastSimpleState(MetricUnit)         as MetricUnit,
       minSimpleState(StartTimestamp)         as StartTimestamp,
       maxSimpleState(RetentionDays)          as RetentionDays,
       -- summary
       sumSimpleState(Count)                  as Count,
       sumSimpleState(Sum)                    as Sum
-- other columns omitted for brevity
FROM metrics_summary
GROUP BY all;
```

Find the full-example from our production configuration in our GitHub Repo: [the metrics schema](https://github.com/highlight/highlight/blob/0374e166783956bf6b0eae8133250a52527873d0/backend/clickhouse/migrations/000132_create_metrics_tables.up.sql) and [the materialized views](https://github.com/highlight/highlight/blob/b2e2b5ea4cfb8aaa2955ea03e32d5161a1b2f5a1/backend/clickhouse/migrations/000136_add_metrics_aggregate_mv.up.sql#L13).

This reduces the volume of stored data by grouping metrics into one-second intervals, balancing granularity and storage
efficiency. In the future, we may also aggregate across metric `Attributes` for keys that are similar across metrics.

## Query Layer

With metrics efficiently ingested and aggregated, querying performance becomes inherent. We share the ClickHouse query layer across the products and can extract metrics just like we query other data ingested in Highlight:

```sql
SELECT Timestamp,
       toFloat64(Sum / Count) as value
FROM metrics
WHERE ProjectId = ?
  AND Timestamp <= ?
  AND Timestamp >= ?
  AND toString(MetricName) = ?
  AND Attributes[?] = ?
```

Additional bucketing logic allows us to aggregate the results in a format that's easily displayed in our [dashboards](https://app.highlight.io/dashboards).

## Conclusion

Building an OpenTelemetry metrics pipeline with ClickHouse offers a scalable and efficient solution for observability.
By leveraging OTLP ingestion, data aggregation, SQL-based querying, and visualization tools, organizations can gain deep
insights into their applications with minimal storage and performance overhead.

Ready to get started? Try out Highlight.io and explore how open-source observability can transform your monitoring
stack. 🚀

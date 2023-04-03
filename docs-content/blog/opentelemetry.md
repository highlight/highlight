---
title: Our Commitment To OpenTelemetry
slug: opentelemetry
---

At highlight.io, we're committed to using open source software for our infrastructure stack. That's why we've partnered with ClickHouse, Kafka, OpenSearch, InfluxDB, and PostgreSQL for our backend architecture to efficiently process ~250 TB of customer data per day. But our promise to our customers goes beyond the technology powering our data ingest.

We're building all of our SDKs using OpenTelemetry to keep a consistent open-source standard for ingesting our data. Building SDKs for different programming languages and frameworks can be challenging. If all SDKs are implemented individually, it can be easy to have disagreement in the format of the data that is sent. This leads to complications of the data ingest as the various formats sent by different SDKs need to be parsed differently. On the other hand, OpenTelemetry defines a standard for how data should be sent, while covering all typical observability use-cases yet being flexible enough to send custom data.

OpenTelemetry is a powerful tool that has become increasingly popular in recent years. The project has its roots in the OpenTracing and OpenCensus projects, which were developed to solve similar problems. OpenTracing focused on defining a standard for distributed tracing instrumentation, while OpenCensus focused on providing a single library for instrumenting telemetry across multiple languages and platforms.

In 2019, the two projects merged to form OpenTelemetry, which aimed to unify the strengths of both projects and provide a single, standard framework for telemetry collection and analysis. Since then, OpenTelemetry has gained widespread adoption in the industry due to its ease of use and flexibility. It provides language-specific libraries for popular programming languages such as Java, Python, Go, and others, making it easy for developers to instrument their code and start collecting telemetry data. It also has integrations with many popular observability tools such as Prometheus, Jaeger, and Zipkin, making it easy to export telemetry data to these tools for analysis and visualization.

## Consistent Format for Traces, Logs, and Metrics

At highlight.io, we have found OpenTelemetry to be an ideal tool for building SDKs across multiple programming languages and frameworks. By using a consistent data specification, we ensure that all of our SDKs send data in the same format, making it easy to parse and ingest. OpenTelemetry also provides native support for traces, logs, and metrics, allowing us to efficiently process large amounts of data without sacrificing performance.

## Efficient Batched and Compressed Data Transfer

OpenTelemetry achieves efficient data transfer through its batching and compression features, which enable the aggregation of multiple telemetry data into a single request, reducing the number of requests needed to transmit data. Additionally, the use of compression algorithms like GZIP further reduces the payload size, decreasing the time required to transmit data and minimizing the network utilization. These capabilities are crucial for applications like highlight.io that require the processing of large volumes of data.

## Hosted Collector for Agent-less Deployments

Another significant benefit of OpenTelemetry is its hosted collector, a cloud-based service that receives telemetry data from different sources and sends it to the backend for processing. The collector acts as an intermediary between the application and the backend, simplifying the deployment process by removing the need to install agents or other software. This approach makes it easy to integrate OpenTelemetry with any application or infrastructure component, and the collector provides features such as data filtering, aggregation, and transformation.

## Reporting Custom Data through Trace Events

In addition to standard telemetry data, OpenTelemetry enables developers to report custom data through trace events. These events allow developers to add context and metadata to their telemetry data, making it more meaningful and informative. Developers can define their own event attributes, which can include any relevant information about their application's state, behavior, or performance. This feature gives developers the flexibility to track specific metrics or events that are unique to their application, providing insights that are specific to their needs.

For example, at highlight.io, our product also tracks errors happening throughout your stack (an exception that is raised and tracks an error with a stacktrace pointing to the source of the issue).
To support sending this kind of data, we've used the tracing OpenTelemetry semantic convention for reporting exceptions.
Trace [event attributes](https://github.com/open-telemetry/opentelemetry-specification/blob/9fa7c656b26647b27e485a6af7e38dc716eba98a/specification/trace/semantic_conventions/exceptions.md#stacktrace-representation) of `exception.type`, `exception.message`, and `exception.stacktrace` allow our tracing provider to plug in to common programming frameworks to report errors in a consistent way.

At highlight.io, we are committed to using open source software for our infrastructure stack, and we believe that OpenTelemetry is an important tool for modern software development. By using OpenTelemetry, we are able to quickly build and deploy SDKs across multiple programming languages and frameworks, while ensuring that our telemetry data is collected and processed efficiently. We also value the open source community and are committed to giving back by contributing to the development of OpenTelemetry and [other open source projects](https://github.com/RichiCoder1/opentelemetry-sdk-workers).

At highlight.io, we're committed to using open source software for our infrastructure stack. That's why we've partnered with ClickHouse, Kafka, OpenSearch, InfluxDB, and PostgreSQL for our backend architecture to efficiently process ~250 TB of customer data per day. 
But our promise to our customers goes beyond the technology powering our data ingest. 
We're building all of our SDKs using OpenTelemetry to keep a consistent open-source standard for ingesting our data.

Building SDKs for different programming languages and frameworks can be challenging. 
The first step relies agreeing on a data specification. 
If all SDKs are implemented individually, it can be easy to have disagreement in the format of the data that is sent.
This leads to complications of the data ingest as the various formats sent by different SDKs need to be parsed differently.
On the other hand, OpenTelemetry defines a standard for how data should be sent, while covering all typical observability use-cases yet being flexible enough to send custom data.

## Consistent Format for Traces, Logs, and Metrics

The OpenTelemetry specification provides for traces, logs and metrics natively in the specification.

For example, at highlight.io, our product also tracks errors happening throughout your stack (an exception that is raised and tracks an error with a stacktrace pointing to the source of the issue).
To support sending this kind of data, we've used the tracing OpenTelemetry semantic convention for reporting exceptions.
Trace [event attributes](https://github.com/open-telemetry/opentelemetry-specification/blob/9fa7c656b26647b27e485a6af7e38dc716eba98a/specification/trace/semantic_conventions/exceptions.md#stacktrace-representation) of `exception.type`, `exception.message`, and `exception.stacktrace` allow our tracing provider to plug in to common programming frameworks to report errors in a consistent way.

## Efficient Batched and Compressed Data Transfer

## Hosted Collector for Agent-less Deployments

## Reporting Custom Data through Trace Events

## Plug-and-play with any OpenTelemetry implementation

## Giving back to the Open Source Community

OpenTelemetry allows the highlight.io engineering team to ship new SDKs quickly while making it possible for outside contributors to jump in with ease.

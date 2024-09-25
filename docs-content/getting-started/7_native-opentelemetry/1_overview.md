---
toc: Overview
title: Native OpenTelemetry
slug: overview
createdAt: 2023-10-16T00:00:00.000Z
updatedAt: 2023-10-16T00:00:00.000Z
---

Using the native OpenTelemetry SDKs? We've got you covered.
The highlight.io SDKs are powered by [OpenTelemetry](https://opentelemetry.io/) under the hood and report data to our deployed OpenTelemetry [collector](https://otel.highlight.io). You can always use our [in-house SDKS](../6_backend-tracing/1_go/1_overview.md), but if you prefer to report raw OTEL data instead, continue reading!


## Quick Start

<DocsCardGroup>
    <DocsCard title="Error Monitoring in OTEL"  href="./2_error-monitoring.md">
        Get started with errors.
    </DocsCard>
    <DocsCard title="Backend Logging in OTEL"  href="./3_logging.md">
        Get started with logs.
    </DocsCard>
    <DocsCard title="Tracing in OTEL"  href="./4_tracing.md">
        Get started with traces.
    </DocsCard>
    <DocsCard title="Browser OTEL" href="./5_browser.md">
        Send Browser instrumentation data to Highlight.
    </DocsCard>
</DocsCardGroup>


The highlight.io SDKs are powered by [OpenTelemetry](https://opentelemetry.io/) under the hood and report data to our deployed OpenTelemetry [collector](https://otel.highlight.io).

## Data Attributes

Data we send via the OpenTelemetry specification is as a [Trace](https://opentelemetry.io/docs/reference/specification/trace/) or a [Log](https://opentelemetry.io/docs/specs/otel/logs/) with attributes set per the [semantic conventions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/).
When we create a Trace, we set three additional SpanAttributes to carry the Highlight context:

- `highlight.project_id` - Highlight Project ID
- `highlight.session_id` - Session ID provided as part of the `X-Highlight-Request` header (ie. `sessionId/requestId`) on the network request
- `highlight.trace_id` - Request ID provided as part of the `X-Highlight-Request` header (ie. `sessionId/requestId`) on the network request

Additional optional attributes are set by highlight to provide additional context:

- `highlight.source` - Set by highlight SDKs to `frontend` or `backend`.
- `highlight.type` - `http.request` for frontend network requests reported by highlight, `highlight.internal` for highlight-internal traces, otherwise unset.
- `highlight.key` - The unique object key for this trace, for grouping by distinct objects in highlight.

We may also send one of the following [Events](https://opentelemetry.io/docs/specs/otel/trace/api/#add-events) on a trace:

- `log` - The trace is processed as a log event.
  - `log.severity` - an [OpenTelemetry log level](https://opentelemetry.io/docs/specs/otel/logs/data-model-appendix/#appendix-b-severitynumber-example-mappings).
  - `log.message` - a string message

- `exception` - An exception is represented in OpenTelemetry as a Trace Event, per the [semantic convention for exceptions](https://opentelemetry.io/docs/specs/otel/trace/exceptions/#attributes).
  - `exception.type` - a string exception type
  - `exception.message` - a string exception message
  - `exception.stacktrace` - a string stacktrace

- `metric` - The trace is processed as a numeric metric.
    - `metric.name` - a string name
    - `metric.value` - a number

## Reporting from Different Services

To differentiate data from different application services, use the service name [semantic conventions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/) with the following attributes:

- `service.name` - a string name identifying the service
- `service.version` - a string identifying for the current application version; typically a git commit hash.

## Reporting an Error

An exception is represented in OpenTelemetry as a Trace Event, per the [semantic convention for exceptions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/exceptions/).

Many OpenTelemetry SDK implementations offer a `span.record_exception(exc)` method that automatically populates the semantic convention attributes with the correct values.

## Recording a Log

If an SDK supports the logs ingest endpoint (`v1/logs`), prefer using that. Otherwise, see below for reporting the log as a trace event.

A LogRecord is exported with an associated trace. Specific attributes for the file logging, line number, and more are set based on the [logging semantic convention keys](https://opentelemetry.io/docs/reference/specification/logs/semantic_conventions/).

## Reporting a Log as an OTEL Trace

If a language's OpenTelemetry SDK does not support sending logs natively, we choose to send the message data as a Trace [Event](https://opentelemetry.io/docs/concepts/signals/traces/#span-events).

- Event name - `log`
  - `log.severity` event attribute - the log severity level string
  - `log.message` event attribute - the log message payload.

To associate the highlight context with a log, we use the `highlight.project_id`, `highlight.session_id`, and `highlight.trace_id` attributes described above.

### Sending to Multiple Observability Backends

If you are sending data to multiple observability backends, you can use the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) to fan out data to multiple destinations. Configure your application's OpenTelemetry SDK to send data to the collector, and configure the collector to send data to your observability backends.

An example fan-out collector configuration YAML looks like so:
```yaml
receivers:
  # listening to the OpenTelemetry SDK from your application
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'

processors:
  batch:

exporters:
  otlphttp/highlight:
    endpoint: 'https://otel.highlight.io'
    compression: gzip
  otlphttp/example:
    endpoint: 'https://example.com/otel'

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/highlight, otlphttp/example]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/highlight, otlphttp/example]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/highlight, otlphttp/example]
```

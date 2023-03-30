---
title: Adding an SDK
slug: adding-an-sdk
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

The highlight.io SDKs are powered by [OpenTelemetry](https://opentelemetry.io/) under the hood, and therefore report data to our deployed opentelemetry [collector](https://otel.highlight.io). For a better understanding of the architecture, take a look at the [architecture page](architecture.md) for a diagram of how data is sent to the collector and the public graph.

In our SDKs, we instantiate the following constructs to exports data over OTLP HTTPS to https://otel.highlight.io:4318/v1/traces and https://otel.highlight.io:4318/v1/logs respectively.

- TracerProvider - sets the global otel sdk configuration for traces
- BatchSpanProcessor - batches traces so they are exported in sets
- OTLPSpanExporter - exports traces to our collector over OTLP HTTPS

- LoggerProvider - sets the global otel sdk configuration for logs
- BatchLogRecordProcessor - batches logs so they are exported in sets
- OTLPLogExporter - exports logs to our collector over OTLP HTTPS

The SDK provides common methods for recording exceptions or logging, but this may depend on the language. For example, in Golang, a logger hook API is provided to be configured by the application, but in Python, we automatically ingest a hook into the built in `logging` package.

## Recording an Error

Data we send over the OpenTelemetry specification is as a [Trace](https://opentelemetry.io/docs/reference/specification/trace/) with attributes set per the [semantic conventions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/).
When we create a Trace, we set three additional SpanAttributes to carry the Highlight context:

- highlight.project_id - Highlight Project ID provided to the SDK

- highlight.session_id - Session ID provided as part of the `X-Highlight-Request` header on the network request

- highlight.trace_id - Request ID provided as part of the `X-Highlight-Request` header on the network request

### Reporting an Error as an OTEL Trace

An exception is represented in OpenTelemetry as a Trace Event, per the [semantic convention for exceptions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/exceptions/).

Many OpenTelemetry SDK implementations offer a `span.record_exception(exc)` method that automatically populates the semantic convention attributes with the correct values.

```python

# create a trace for the current invocation
with self.tracer.start_as_current_span("highlight-ctx") as span:
    span.set_attributes({"highlight.project_id": _project_id})
    span.set_attributes({"highlight.session_id": session_id})
    span.set_attributes({"highlight.trace_id": request_id})
    try:
        # contextmanager yields execution to the code using the contextmanager
        yield
    except Exception as e:
        # if an exception is raised, record it on the current span
        span.record_exception(e)
        raise

```

### Reporting a Log as an OTEL Trace

If a language's OpenTelemetry SDK does not support sending logs natively, we choose to send the message data as a Trace [Event](https://opentelemetry.io/docs/concepts/signals/traces/#span-events).

- Event name - `log`

- `log.severity` event attribute - the log severity level string

- `log.message` event attribute - the log message payload.

To associate the highlight context with a log, we use the [LogRecord](https://opentelemetry.io/docs/reference/specification/logs/data-model/#log-and-event-record-definition) [Attributes](https://opentelemetry.io/docs/reference/specification/logs/semantic_conventions/) with the following convention:

- highlight.project_id - Highlight Project ID provided to the SDK

- highlight.session_id - Session ID provided as part of the `X-Highlight-Request` header on the network request

- highlight.trace_id - Request ID provided as part of the `X-Highlight-Request` header on the network request

```go

package main

import "github.com/highlight/highlight/sdk/highlight-go"

func RecordLog(log string) {
	span, _ := highlight.StartTrace(context.TODO(), "highlight-go/logrus")
	defer highlight.EndTrace(span)

	attrs := []attribute.KeyValue{
		LogSeverityKey.String("ERROR"),
		LogMessageKey.String(entry.Message),
	}
	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...))
}

```

## Recording a Log

If an SDK supports the experimental logs ingest endpoint (v1/logs), prefer using that. Otherwise, see above for reporting the log as a trace event.

A LogRecord is exported with an associated trace. Specific attributes for the file logging, line number, and more are set based on the [logging semantic convention keys](https://opentelemetry.io/docs/reference/specification/logs/semantic_conventions/).

Here's an example of the interception of python `logging` calls in our [Python SDK](https://github.com/highlight/highlight/blob/93bfea864440a1976ac945ba2b40a34cf3b53479/sdk/highlight-py/highlight_io/sdk.py#L139-L160) to emit an OTEL LogRecord.

```python

attributes = span.attributes.copy()
attributes["code.function"] = record.funcName
attributes["code.namespace"] = record.module
attributes["code.filepath"] = record.pathname
attributes["code.lineno"] = record.lineno
r = LogRecord(
    timestamp=int(record.created * 1000.0 * 1000.0 * 1000.0),
    trace_id=ctx.trace_id,
    span_id=ctx.span_id,
    trace_flags=ctx.trace_flags,
    severity_text=record.levelname,
    severity_number=std_to_otel(record.levelno),
    body=record.getMessage(),
    resource=span.resource,
    attributes=attributes,
)

```

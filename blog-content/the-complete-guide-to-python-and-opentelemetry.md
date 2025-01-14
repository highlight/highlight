---
title: "The complete guide to OpenTelemetry in Python"
createdAt: 2025-01-14T12:00:00Z
readingTime: 18
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight 
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: 'https://avatars.githubusercontent.com/u/1351531?v=4'
tags: Developer Tooling, Python, OpenTelemetry
metaTitle: "The complete guide to OpenTelemetry in Python"
---

```hint
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring distribution. If you’re interested in learning more, get started at [app.highlight.io](https://app.highlight.io).
```
<br/>

OpenTelemetry is an important specification that defines how we send telemetry data to observability backends like Highlight.io, Grafana, and others. If you're new to OpenTelemetry, you can learn more about it [here](https://www.youtube.com/watch?v=ASgosEzG4Pw). One of the most popular ways to use OpenTelemetry is from application code, and as you probably already know, Python is one of the most popular languages for backend development.


<br/>
Today, we'll go through a complete guide to using OpenTelemetry in Python, including the high-level concepts as well as how to send traces and logs to your OpenTelemetry backend of choice.

## **High-Level Concepts**

When working with OpenTelemetry in your application code, there are several key components that you should wrap your head around. These components are designed to be flexible and can be used for all signals. Let's go through each of them:

### **Provider**

A provider is the API entry point that holds the configuration for telemetry data. In the context of tracing, this would be a `TracingProvider`, and for logging, it would be a `LoggingProvider`. The provider is responsible for setting up the environment and ensuring that all necessary configurations are in place. This can include configuring a vendor specific api key, or something as simple as setting the service name and environment. 

For example, a `TracingProvider` could set up the resource attributes like service name and environment, and set the highlight project id so that the traces are associated with your Highlight project. 

Here's an quick example of what this looks like in code:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider


provider = TracerProvider(resource=Resource.create(
    {
        "service.name": "my-service",
        "highlight.project_id": "<YOUR_PROJECT_ID>",
        "environment": "production",
    }
))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("my-service")
```

### **Processor**

A processor defines the method of sending the created elements, such as spans or log records.  This is important because you may have specific needs on the machine that you're sending data from that require customization. For instance, a `BatchSpanProcessor` collects spans in batches and sends them to the exporter, which is more efficient than sending each span individually. 

Here's an example of how you might configure a `BatchSpanProcessor`:

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

processor = BatchSpanProcessor()
```

### **Exporter**

Finally, an exporter is the actual object that sends the telemetry data to the backend. This is where you configure the endpoint and any other necessary settings. For example, an `OTLPSpanExporter` would configure the endpoint and any necessary headers, while an `ConsoleSpanExporter` would simply print the spans to the console.

Here's an example of how you might configure an `OTLPSpanExporter`:

```python
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# exporter setup
exporter = OTLPSpanExporter(endpoint="https://otel.highlight.io:4317")
```

<BlogCallToAction />

## **Instrumenting your application**

### Logging

Now that we're familiar with the high-level concepts, let's see how we can instrument our application to send logs to an OpenTelemetry backend. In this example, we'll assume that we're sending data to Highlight.io, but the same principles apply to any other backend.

First, lets install the necessary packages:

```bash
pip install opentelemetry-api
pip install opentelemetry-sdk
pip install opentelemetry-exporter-otlp
```

Next, we'll need to set up the provider, processor, and exporter.

```python
service_name = "my-service"
environment = "production"
otel_endpoint = "https://otel.highlight.io:4317"

# Set up the logger provider with the resource
logger_provider = LoggerProvider(resource=Resource.create(
    {
        "service.name": service_name,
        "highlight.project_id": "<YOUR_PROJECT_ID>",
        "environment": environment,
    }
))
set_logger_provider(logger_provider)

# Configure the OTLP log exporter
exporter = OTLPLogExporter(endpoint=otel_endpoint, insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))

# Set up the logger
logger = logging.getLogger(service_name)
logger.setLevel(logging.DEBUG)

# Add the OpenTelemetry logging handler
handler = LoggingHandler(level=logging.DEBUG, logger_provider=logger_provider)
logger.addHandler(handler)

# Add console handler for stdout (optional)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

```
### Tracing

Similar to logging, we can instrument our application to send traces to an OpenTelemetry backend. Like, in the logging example, lets start with installing the necessary packages:

```bash
pip install opentelemetry-api
pip install opentelemetry-sdk
pip install opentelemetry-exporter-otlp
```

Next, we'll need to set up the provider, processor, and exporter.

```python
import logging
from opentelemetry import trace
from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
import sys

# Define the service name and environment
service_name = "my-service"
environment = "production"
otel_endpoint = "https://otel.highlight.io:4317"

# Create a resource with service name and highlight project ID
provider = TracerProvider(resource=Resource.create(
    {
        "service.name": service_name,
        "highlight.project_id": "<YOUR_PROJECT_ID>",
        "environment": environment,
    }
))
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=otel_endpoint, insecure=True))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(service_name)

```

And that's it! You've now instrumented your application to send logs and traces to an OpenTelemetry backend. Once you've done this, you can start using the `tracer` and `logger` objects to start sending data to your backend, like so:

```python
    with tracer.start_as_current_span("example-span"):
        logger.info('hello, world!')
        logger.warning('whoa there', {'key': 'value'})`,
```


## **Conclusion**

In this guide, we've gone through a complete guide to using OpenTelemetry in Python, including the high-level concepts as well as how to send traces and logs to your OpenTelemetry backend of choice. 

If you have any questions, please feel free to reach out to us on [Twitter](https://twitter.com/highlight_io) or [Discord](https://highlight.io/community).
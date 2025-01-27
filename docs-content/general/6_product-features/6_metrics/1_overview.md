---
toc: Overview
title: Dashboards
slug: overview
---

## OpenTelemetry Metrics with Highlight

Highlight supports accepting OpenTelemetry (OTel) metrics at our dedicated endpoint: `otel.highlight.io`. This allows you to seamlessly integrate your application's telemetry data with Highlight, providing you with powerful insights and monitoring capabilities.

### Getting Started with Python

To get started with sending OTel metrics to Highlight using Python, for example, you can follow the example [here](../../../getting-started/8_native-opentelemetry/6_metrics.md)

Here is a brief overview of the steps involved:

1. **Install the necessary packages**:
   Ensure you have the required OpenTelemetry packages installed. You can do this using pip:
   ```bash
   pip install opentelemetry-api
   pip install opentelemetry-sdk
   pip install opentelemetry-exporter-otlp
   ```

2. **Configure the OpenTelemetry SDK**:
   Set up the OpenTelemetry SDK to export metrics to Highlight's OTel endpoint.
   ```python
   from opentelemetry import metrics
   from opentelemetry.sdk.metrics import MeterProvider
   from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
   from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

   # Set up the OTLP exporter
   exporter = OTLPMetricExporter(endpoint="https://otel.highlight.io")

   # Set up the metric reader
   metric_reader = PeriodicExportingMetricReader(exporter)

   # Set up the meter provider
   provider = MeterProvider(metric_readers=[metric_reader])
   metrics.set_meter_provider(provider)

   # Create a meter
   meter = metrics.get_meter(__name__)

   # Create and record a metric
   counter = meter.create_counter(
       name="example_counter",
       description="An example counter",
       unit="1",
   )

   # Record a value
   counter.add(1, {"environment": "production"})
   ```

3. **Run your application**:
   With the above configuration, your application will start sending metrics to Highlight's OTel endpoint. You can then view and analyze these metrics within the Highlight dashboard.

By following these steps, you can easily integrate OpenTelemetry metrics with Highlight, enabling you to monitor and gain insights into your application's performance and behavior.

For more detailed instructions and examples, please refer to the [complete guide](https://www.highlight.io/blog/the-complete-guide-to-python-and-opentelemetry).

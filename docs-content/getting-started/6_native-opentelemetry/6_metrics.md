---
title: Metrics
slug: metrics
heading: OpenTelemetry Metrics
metaTitle: Send OpenTelemetry Metrics to Highlight
createdAt: 2024-09-17T00:00:00.000Z
updatedAt: 2024-09-17T00:00:00.000Z
quickstart: true
---

If you want to send OpenTelemetry metrics to Highlight you can do this by making a couple tweaks to your metrics configuration.

### 1. Add resource attributes

In order to associate spans with your project and sessions in Highlight, you'll need to add a few attributes:

* `highlight.project_id` - Allows us to associate traces with your project. This can be accessed from [your Highlight account](https://app.highlight.io/setup).
* `service.name` (optional) - Specify the service name you want to assign on your traces. This makes it easier to filter to all traces from this instrumentation.

At the application, level you can set these attributes when creating your metrics provider. Also, make sure that the preferred temporality is set to `DELTA` for all metrics, and set the exporter to send data to the Highlight collector.

### 2. Install the OpenTelemetry SDK

```bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-grpc
```

### 3. Configure the OpenTelemetry SDK

```python
# Set up the meter provider with the resource
preferred_temporality: dict[type, AggregationTemporality] = {
        Counter: AggregationTemporality.DELTA,
        UpDownCounter: AggregationTemporality.DELTA,
        Histogram: AggregationTemporality.DELTA,
}
readers = [PeriodicExportingMetricReader(exporter=OTLPMetricExporter(endpoint="https://otel.highlight.io:4317", insecure=True, preferred_temporality=preferred_temporality))]
provider = MeterProvider(resource=Resource.create(
    {
        "service.name": service_name,
        "highlight.project_id": HIGHLIGHT_PROJECT_ID,
        "environment": environment,
        "commit": commit
    }
), metric_readers=readers)
metrics.set_meter_provider(provider)
meter = metrics.get_meter(service_name)
counter = meter.create_counter("my-counter")
counter.add(1)
```

### 4. Verify data is flowing correctly

Verify data is being sent to Highlight correctly. You can check the network traffic in your browser dev tools to verify requests are being made. If data is flowing you can log into Highlight and go to the dashboard page, then filter by metrics with the service name that you specified in the `service.name` attribute. For more details on how to query these metrics, see our [metrics documentation](../../general/6_product-features/6_metrics/1_overview.md).
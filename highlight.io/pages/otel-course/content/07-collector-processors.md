---
id: undefined
title: "OpenTelemetry Collector and Processors"
order: 7
---

A deep dive into the OpenTelemetry Collector, its setup, and how to configure processors and exporters to tailor data pipelines for different observability needs.

```yaml
# Example collector configuration
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 1000
  attributes:
    actions:
      - key: environment
        value: production
        action: insert

exporters:
  otlp:
    endpoint: "observability-backend:4317"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes]
      exporters: [otlp]
```

Learn about:

- Collector architecture and components
- Common processors and their use cases
- Pipeline configuration
- Performance tuning
- High availability setup

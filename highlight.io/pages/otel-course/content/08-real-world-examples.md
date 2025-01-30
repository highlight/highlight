---
id: undefined
title: "OpenTelemetry in Real-world Scenarios"
slug: "real-world-examples"
---

Explore practical examples of OpenTelemetry in action within microservices, cloud environments (AWS, Google Cloud, Azure), and Kubernetes, showcasing real-world use cases.

```yaml
# Example Kubernetes deployment with OpenTelemetry auto-instrumentation
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    metadata:
      annotations:
        instrumentation.opentelemetry.io/inject-sdk: "true"
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        env:
        - name: OTEL_SERVICE_NAME
          value: "my-service"
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://otel-collector:4317"
```

Case Studies:

- Microservices observability
- Cloud-native monitoring
- Kubernetes integration
- Service mesh integration
- Multi-cloud deployments

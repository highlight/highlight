---
id: undefined
title: "OpenTelemetry Metrics"
slug: "metrics"
---

Focuses on metrics collection and exporting, explaining different types of metrics (counters, gauges, histograms) and how to use OpenTelemetry to monitor application performance.

```typescript
// Example of metrics in Node.js
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('example-metrics');

// Create a counter
const requestCounter = meter.createCounter('requests', {
  description: 'Count of requests received'
});

// Create a gauge
const activeRequests = meter.createUpDownCounter('active_requests', {
  description: 'Number of requests currently being handled'
});

// Create a histogram
const requestDuration = meter.createHistogram('request_duration', {
  description: 'Duration of requests in milliseconds'
});
```

Learn how to:

- Set up metrics collection
- Configure different metric types
- Export metrics to your observability backend
- Create custom metrics for your application
- Best practices for metric naming and labels

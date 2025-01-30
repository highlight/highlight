---
id: undefined
title: "OpenTelemetry Tracing"
slug: "tracing"
---

Introduction to distributed tracing with OpenTelemetry. Learn how to instrument applications for tracing across different languages, and how to export trace data to observability platforms.

```typescript
// Example of basic tracing in Node.js
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('example-basic-tracer');

async function operationWithSpan() {
  const span = tracer.startSpan('my-operation');
  try {
    // Your operation code here
    await doSomething();
  } finally {
    span.end();
  }
}
```

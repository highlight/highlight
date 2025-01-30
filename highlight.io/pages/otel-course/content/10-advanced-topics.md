---
id: undefined
title: "Advanced Topics and the Future of OpenTelemetry"
slug: "advanced-topics"
---

Explore advanced custom instrumentation, monitoring for AI/ML applications, and the future trends of OpenTelemetry in observability and beyond.

Advanced Topics:

- Custom Instrumentation

  ```typescript
  // Custom span processor
  class CustomSpanProcessor implements SpanProcessor {
    onStart(span: Span, context: Context): void {
      span.setAttribute('custom.start_time', Date.now());
    }

    onEnd(span: ReadableSpan): void {
      // Custom processing logic
    }

    shutdown(): Promise<void> {
      return Promise.resolve();
    }
  }
  ```

- AI/ML Monitoring

  ```python
  # Monitoring ML model inference
  with tracer.start_as_current_span("model_inference") as span:
      span.set_attribute("model.name", "gpt-3")
      span.set_attribute("batch.size", batch_size)

      start_time = time.time()
      prediction = model.predict(input_data)
      inference_time = time.time() - start_time

      span.set_attribute("inference.duration_ms", inference_time * 1000)
      span.set_attribute("inference.output_shape", str(prediction.shape))
  ```

Future Trends:

- eBPF integration
- Continuous profiling
- Automated root cause analysis
- AI-powered observability
- Edge computing observability

## Working with Existing Logs

If you already have an app and can't rewrite all your logging code, there's a good chance the OpenTelemetry collector can work with the logs you already have and transform them to meet the spec. This is where [receivers](...) come in. For example, you can use the [filelogreceiver](...) to trail and parse logs that are written to a static file.

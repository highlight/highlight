---
title: The complete guide to OpenTelemetry in Next.js
createdAt: 2025-02-10T12:00:00.000Z
readingTime: 21
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: 'https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c'
tags: 'Engineering, Backend, Observability'
metaTitle: The complete guide to OpenTelemetry in Next.js
---

```hint
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. If you’re interested in learning more, get started at [highlight.io](https://highlight.io).
```
<br/>

OpenTelemetry is an important specification that defines how we send telemetry data to observability backends like Highlight.io, Grafana, and others. OpenTelemetry is great because it is vendor agnostic, and can be used with several observability backends. If you're new to OpenTelemetry, you can learn more about it [here](https://www.youtube.com/watch?v=ASgosEzG4Pw). 


Today, we'll go through a complete guide to using OpenTelemetry in Python, including the high-level concepts as well as how to send traces and logs to your OpenTelemetry backend of choice.


## Setting Up OpenTelemetry for Next.js: Tracing, Logging, and Metrics

Observability is crucial for understanding the performance and behavior of your Next.js application. OpenTelemetry (OTel) provides a robust framework for collecting the observability data you need to gain deep insights into how your application operates.

In this guide, we’ll walk through setting up OpenTelemetry in a Next.js project, covering:
- Tracing: Capturing distributed traces for API requests and page transitions
- Logging: Collecting structured logs that correlate with traces
- Metrics: Exporting performance and custom application metrics
- Built-in Spans: Leveraging Next.js’s automatic spans and debugging with `NEXT_OTEL_VERBOSE`
- Exception Tracking: Capturing errors within traces
- Simplifying Setup with @vercel/otel

By the end of this tutorial, you’ll have OpenTelemetry integrated into your Next.js project with traces, logs, and metrics exported to your preferred backend.

### Installing OpenTelemetry in Next.js

To get started, install the necessary OpenTelemetry dependencies:

```bash
yarn add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/instrumentation-http @opentelemetry/instrumentation-fetch @opentelemetry/exporter-trace-otlp-grpc @opentelemetry/exporter-metrics-otlp-grpc @opentelemetry/resources @opentelemetry/semantic-conventions
```

This setup includes the core OpenTelemetry API, SDK, HTTP and Fetch instrumentations, and OTLP exporters for traces and metrics.

### Setting Up the OpenTelemetry SDK

Create a new file `otel.js` at the root of your Next.js project:

```javascript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SEMRESOURCENAME } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESOURCENAME.SERVICE_NAME]: 'nextjs-app',
  }),
  traceExporter: new OTLPTraceExporter(), 
  metricExporter: new OTLPMetricExporter(), 
  instrumentations: [new HttpInstrumentation(), new FetchInstrumentation()],
});

sdk.start();
console.log('OpenTelemetry initialized');
```

To trigger this file to run when the app starts, you can invoke it from the Next.js magic `instrumentation.js` file.

```javascript
import './otel';
```

The [instrumentation.js file](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation) is automatically detected by Next.js and will run when the app starts. Before Next.js 15, the instrumentation is experimental, so you will have to enable it explicitly:

```javascript
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
};
```


### Enabling OpenTelemetry in Next.js

Automatic Spans in Next.js

Next.js has built-in OpenTelemetry spans for various parts of the application, including:
- API routes (pages/api or app/api)
- Page router (Pages Directory)
- App router (App Directory)

To enable verbose OpenTelemetry logging, set the following environment variable:

```bash
NEXT_OTEL_VERBOSE=1
```

With this enabled, Next.js will provide detailed span information in the logs, making it easier to debug and understand request flow.

### Tracing API Requests and Page Loads

#### Tracing API Routes

Next.js automatically creates spans for API requests. For example, a request to /api/user will generate spans like:
- next.js /api/user request
- next.js /api/user handler
- fetch /external-api (if the API calls another service)

If you have an API route in pages/api/user.ts:

```javascript
export default async function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}
```

You can observe spans for:
✅ Incoming request (GET /api/user)
✅ Response timing
✅ Any internal or external API calls

#### Tracing Page Router (Pages Directory)

For traditional Next.js pages (pages/index.js):

```javascript
export default function HomePage() {
  return <h1>Welcome to Next.js</h1>;
}
```

When a user navigates to /, Next.js automatically creates spans for:
- next.js / (page load)
- next.js render /index
- fetch spans (if the page makes API calls)

#### Tracing App Router (App Directory)

If you’re using the Next.js App Router (app/page.tsx), spans will include:
- Page load spans (next.js /app/page.tsx)
- Server component execution spans (next.js /layout.tsx)
- Data fetching spans for fetch() calls in server components

For example, an app router component:

```javascript
export default function Page() {
  return <h1>Welcome to the App Router!</h1>;
}
```
will automatically generate spans for rendering and hydration.

### Logging in OpenTelemetry

To correlate logs with traces, install OpenTelemetry logging:


```bash
yarn add @opentelemetry/sdk-logs
```

Modify `otel.js`:

```javascript
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { ConsoleLogger } from '@opentelemetry/sdk-logs';

const loggerProvider = new LoggerProvider();
const logger = loggerProvider.getLogger('nextjs-logger');

logger.emit({
  severityText: 'INFO',
  body: 'Application started',
});
```
This allows you to log messages that correlate with traces.

### Capturing Exceptions with Spans

To capture exceptions inside traces, you can manually add error attributes to spans. Modify your API route:

```javascript
import { trace } from '@opentelemetry/api';

export default async function handler(req, res) {
  const span = trace.getActiveSpan();
  
  try {
    throw new Error('Something went wrong!');
  } catch (error) {
    if (span) {
      span.setAttribute('error', true);
      span.recordException(error);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```
This ensures that the error is captured within the OpenTelemetry trace and can be visualized in your tracing backend.

### Exporting Metrics

Next.js applications often benefit from metrics like request count, latency, and errors. Here's how to add instrumentation for request tracking in `otel.js`:

```javascript
import { MeterProvider } from '@opentelemetry/sdk-metrics';

const meter = new MeterProvider().getMeter('nextjs-meter');
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Counts total HTTP requests',
});

export function trackRequest() {
  requestCounter.add(1);
}
```

Then, use it in an API route:
```javascript
import { trackRequest } from '../../otel';

export default function handler(req, res) {
  trackRequest();
  res.status(200).json({ message: 'Metrics tracked!' });
}
```

### Simplifying with @vercel/otel

If you’re deploying your Next.js application on Vercel, the easiest way to integrate OpenTelemetry is by using the @vercel/otel package. This package simplifies the entire setup process and automatically enables distributed tracing for your application.

What is @vercel/otel?

@vercel/otel is an official package from Vercel that adds built-in support for OpenTelemetry in your Next.js app. It eliminates the need to manually configure OpenTelemetry SDKs, exporters, and instrumentations, offering you:
- Automatic tracing for API routes, pages, and server-side rendering (SSR)
- Built-in span creation for Next.js internals
- Exception tracking out of the box
- Export to OpenTelemetry-compatible backends (e.g., Highlight.io)

We've covered this topic in more detail previously with our [blog on setting up @vercel/otel in Next.js](./how-to-use-opentelemetry-to-monitor-nextjs-apps.md), so make sure to check it out for a full guide.

### Putting it all together

Let's put all of the pieces together and create a complete `otel.js` file that will automatically instrument your Next.js app. Using `@vercel/otel`, we'll configure export for Highlight.io, but you can use any other OpenTelemetry-compatible backend:

```typescript
import { registerOTel } from "@vercel/otel";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-grpc";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerOTel({
      serviceName: "my-next-js-app",
      attributes: {
        "highlight.project_id": "<YOUR_PROJECT_ID>",
        "deployment.environment.name": process.env.NODE_ENV,
      },
      propagators: ["auto"],
      spanProcessors: [
        new SimpleSpanProcessor(
          new OTLPTraceExporter({
            url: "https://otel.highlight.io:4317/v1/traces",
            keepAlive: true,
          }),
        ),
      ],
      logRecordProcessor: new SimpleLogRecordProcessor(
        new OTLPLogExporter({
          url: "https://otel.highlight.io:4317/v1/logs",
          keepAlive: true,
        }),
      ),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: "https://otel.highlight.io:4317/v1/metrics",
          keepAlive: true,
        }),
      }),
    });
  }
}
```

Now, let's use the OpenTelemetry SDK in our route to emit data:

```typescript
import { NextResponse } from "next/server";
import api, { propagation } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

export async function GET() {
  const { email, name } = req.query;

  // Here, you would typically make a call to your Python service
  // passing the user's email or other identifier
  // For now, we'll just log the information and return mock data
  console.log(`Fetching data for user: ${email} ${name}`);

  // In a real implementation, you would fetch data from the Garmin Health API here
  const tracerProvider = api.trace.getTracerProvider();
  const tracer = tracerProvider.getTracer("data");
  const data = await tracer.startActiveSpan(
    "data.fetch",
    {
      attributes: {
        "user.email": email || undefined,
        "user.name": name || undefined,
      },
    },
    async () => {
      console.log("Fetching data...", { email });
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.PYTHON_API_SECRET}`,
      };
      propagation.inject(api.context.active(), headers);
      const response = await fetch(
        `${process.env.PYTHON_API_HOSTNAME}/users/scrape`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            email,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return await response.json();
    },
  );

  const meterProvider = api.metrics.getMeterProvider();
  const meter = meterProvider.getMeter("data");
  const gauge = meter.createObservableGauge("data.metric");
  for (const d of data) {
    gauge.addCallback((m) => {
      m.observe(d.attribute);
    });
  }

  const provider = logs.getLoggerProvider();
  const logger = provider.getLogger("data");
  logger.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: "INFO",
    body: "returning data",
    attributes: { data },
  });

  return NextResponse.json(data);
```

### Conclusion

By integrating OpenTelemetry into your Next.js app, you gain:

✅ Automatic tracing for API routes and page loads

✅ Detailed spans for App Router and Page Router

✅ Exception tracking within spans

✅ Structured logging with correlation to traces

✅ Custom metrics for tracking performance

With `NEXT_OTEL_VERBOSE=1`, you can further debug your application’s span structure.

Now, send your telemetry data to a backend like Jaeger, Prometheus, or Honeycomb and start gaining powerful insights into your Next.js application! 🚀

💡 Next Steps:
- Set up OpenTelemetry with a real backend (Jaeger, Grafana, etc.)
- Explore Baggage API for propagating metadata across services
- Optimize sampling rates to balance performance and observability

---
title: The complete guide to OpenTelemetry in Next.js
createdAt: 2025-02-10T12:00:00.000Z
readingTime: 14
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
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. Check out [highlight.io](https://highlight.io) if you’re interested in learning more.
```
<br/>

OpenTelemetry is an important specification that defines how we send telemetry data to observability backends like Highlight.io, Grafana, and others. OpenTelemetry is great because it is vendor agnostic, and can be used with several observability backends. If you're new to OpenTelemetry, you can learn more about it [here](https://www.youtube.com/watch?v=ASgosEzG4Pw). 


This complete guide to OpenTelemetry in Next.js covers high-level concepts as well as how to send traces, logs, and metrics to your OpenTelemetry backend of choice.


## Setting Up OpenTelemetry for Next.js: Tracing, Logging, and Metrics

Let's walk through setting up OpenTelemetry in a Next.js project, covering:
- Tracing: Capturing distributed traces for API requests and page transitions
- Logging: Collecting structured logs that correlate with traces
- Metrics: Exporting performance and custom application metrics

There are several reasons that make OTel a great choice for monitoring your Next.js application:
- Built-in Spans: Next.js provides automatic spans at the framework level
- Exception Tracking: Errors are automatically captured within traces by the framework
- Simplified Setup: [@vercel/otel](https://vercel.com/docs/observability/otel-overview) eliminates the need to manually configure OpenTelemetry SDKs, exporters, and instrumentations

By the end of this tutorial, you'll have all the observability data you need to be proactively notified when something goes wrong, troubleshoot issues quickly, and fix performance bottlenecks in the critical parts of your code.

### Installing OpenTelemetry in Next.js

We've covered instrumenting Next.js with `@vercel/otel` in our [blog post on using @vercel/otel in Next.js](./lw5-vercel-otel-nextjs-tracing.md).
While `@vercel/otel` is a simpler option for many applications, it may not give you full control over the OpenTelemetry SDKs.
Today, we'll go through a complete guide to setting up OpenTelemetry from scratch, explaining the configuration options along the way.

```hint
Our implementation covers setting up @opentelemetry/sdk-node which is only compatible with the Node.js runtime.
If you are using the Edge runtime in Next.js, you'll need to use @vercel/otel which conditionally switches to the
@opentelemetry/sdk-trace-web implementation which is Edge runtime compatible, or implement a similar approach yourself.`
```

To get started, install the necessary OpenTelemetry dependencies:

```bash
yarn add @opentelemetry/api @opentelemetry/api-logs @opentelemetry/sdk-node \
  @opentelemetry/instrumentation-http @opentelemetry/instrumentation-fetch \
  @opentelemetry/exporter-trace-otlp-grpc @opentelemetry/exporter-logs-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc @opentelemetry/resources @opentelemetry/semantic-conventions
```

This setup includes the core OpenTelemetry API, SDK, HTTP and Fetch instrumentations, and OTLP exporters for traces and metrics.

### Setting Up the OpenTelemetry SDK

Create a new file `otel.ts` at the root of your Next.js project:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SEMRESOURCENAME } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const exporter = new OTLPTraceExporter(config)
const spanProcessor = new BatchSpanProcessor(exporter, opts)

const logsExporter = new OTLPLogExporter(config)
const logProcessor = new BatchLogRecordProcessor(logsExporter, opts)

const metricsExporter = new OTLPMetricExporter(config)
const metricsReader = new PeriodicExportingMetricReader({exporter: metricsExporter})

// Configure the OTLP exporter to send data to your OpenTelemetry backend
const config = { url: 'https://otel.highlight.io:4317' }
const sdk = new NodeSDK({
  autoDetectResources: true,
  resourceDetectors: [processDetectorSync],
  resource: new Resource({
    [SEMRESOURCENAME.SERVICE_NAME]: 'nextjs-app',
    'highlight.project_id': '<YOUR_PROJECT_ID>',
  }),
  spanProcessors: [spanProcessor],
  logRecordProcessors: [logProcessor],
  metricReader: metricReader,
  traceExporter: exporter,
  contextManager: new AsyncLocalStorageContextManager(),
  sampler: new AlwaysOnSampler(),
  instrumentations: [new HttpInstrumentation(), new FetchInstrumentation()],
})

sdk.start();
console.log('OpenTelemetry initialized');
```

To trigger this file to run when the app starts, you can invoke it from the Next.js magic `instrumentation.ts` file.

```typescript
export function register() {
  await import('./otel');
}
```

The [instrumentation.ts file](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation) is automatically detected by Next.js and will run when the app starts. Before Next.js 15, the instrumentation is experimental, so you will have to enable it explicitly:

```typescript
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
};
```


### Configuring Tracing

With the SDK configured, your application will start to export the telemetry data using the exporters defined.
However, you may wonder what data is being captured without any explicit code added.

[Next.js has built-in OpenTelemetry spans](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#default-spans-in-nextjs)
for various parts of the application, including:
- API routes (`pages/api` or `app/api`)
- Page router (Pages Directory)
- App router (App Directory)

Some top-level spans are emitted out-of-the-box, while others can be turned on by turning on verbose logging:

```bash
NEXT_OTEL_VERBOSE=1
```

Setting the `NEXT_OTEL_VERBOSE` environment variable will emit additional traces that give you more granularity of the code execution.

For example, here's a flame graph visualization of a trace without verbose tracing, `NEXT_OTEL_VERBOSE=0`:

![](/images/blog/nextjs-otel/not-verbose.png)

And here's the same trace with verbose tracing enabled, `NEXT_OTEL_VERBOSE=1`:

![](/images/blog/nextjs-otel/verbose.png)

Let's go through some examples of the data that can be captured.

![](/images/blog/nextjs-otel/trace.png)

In the image above, you can see the trace start with an api route request that is piped through Next.js to the API handler.
We also see a custom span that wraps an ourgoing API request to another service. Because we set up auto-instrumentation, 
we capture the `fetch` call automatically, and can even propagate the trace context to the backend service.

Here's a list of the top-level spans that are captured automatically by Next.js:

- **BaseServer.handleRequest** - Named `[http.method] [next.route]`, [the root span for each incoming request to your Next.js application](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#httpmethod-nextroute).
- **AppRender.getBodyResult** - Named `render route (app) [next.route]`, [represents the process of rendering a route in the app router](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#render-route-app-nextroute).
- **AppRender.fetch** - Named `fetch [http.method] [http.url]`, [represents the fetch request executed in your code](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#fetch-httpmethod-httpurl).
- **AppRouteRouteHandlers.runHandler** - Named `executing api route (app) [next.route]`, [represents the execution of an API Route Handler in the app router](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#executing-api-route-app-nextroute).
- **Render.getServerSideProps** - Named `getServerSideProps [next.route]`, [represents the execution of getServerSideProps for a specific route](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#getserversideprops-nextroute).
- **Render.getStaticProps** - Named `getStaticProps [next.route]`, [represents the execution of getStaticProps for a specific route](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#getstaticprops-nextroute).
- **Render.renderDocument** - Named `render route (pages) [next.route]`, [represents the process of rendering the document for a specific route](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#render-route-pages-nextroute).
- **ResolveMetadata.generateMetadata** - Named `generateMetadata [next.page]`, [represents the process of generating metadata for a specific route](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#generatemetadata-nextpage).
- **NextNodeServer.findPageComponents** - Named `resolve page components`, [represents the process of resolving page components for a specific page](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#resolve-page-components).
- **NextNodeServer.getLayoutOrPageModule** - Named `resolve segment modules`, [represents loading of code modules for a layout or a page](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#resolve-segment-modules).
- **NextNodeServer.startResponse** - Named `start response`, [represents the process of starting the response for a specific route](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#start-response).

[See the Next.js docs for more details.](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#default-spans-in-nextjs)

Whether you have an API route, a page route, or an app route, you'll see a span for each request.
Spans will carry details such as what route was requested, how long each step of the processing took,
and what metadata was provided in the HTTP request. 

The power lies in connecting the automatic spans
with custom ones and ones provided by additional OpenTelemetry instrumentations. 
As shown in the image above,
when the app route api method makes an outgoing HTTP request to another service (in this case, an example Python service),
the trace will capture the duration of the backend API request and the response status code.
At a glance, that can help diagnose a performance issue due to a downstream service or a failed backend API call.

### Logging in OpenTelemetry

Let's add some more logic to `otel.ts` to create a logger that can be used to emit custom messages.

```typescript
import { LoggerProvider } from '@opentelemetry/sdk-logs';

const loggerProvider = new LoggerProvider();
const logger = loggerProvider.getLogger('nextjs-logger');

logger.emit({
  severityText: 'INFO',
  body: 'Application started',
});
```

You can use this logger in your code or with a helper method. 
Make sure to check out other [OpenTelemetry logging instrumentations](https://opentelemetry.io/ecosystem/registry/?language=js&component=instrumentation)
that can automatically hook into [common logging libraries](./nodejs-logging-libraries.md) like Winston or Pino.

If you want to capture console logger methods such as `console.log`, `console.error`, etc., 
you'll need to manually instrument them to record their logs to the OpenTelemetry logger.
Here's an example of how to do that:

```typescript
import { LoggerProvider } from '@opentelemetry/sdk-logs';

const loggerProvider = new LoggerProvider();
const logger = loggerProvider.getLogger('nextjs-logger');

const originalConsoleLog = console.log;
console.log = (...args) => {
  originalConsoleLog(...args);
  logger.emit({
    severityText: 'INFO',
    body: args.join(' '),
  });
};

console.log('Hello, world!');
```

### Capturing Exceptions with Spans

Let's emit a custom span in our code that can be used to capture an exception.
We'll start a span and then automatically add error attributes by capturing the error. 
Modify your API route:

```typescript
import { trace } from '@opentelemetry/api';

const tracerProvider = trace.getTracerProvider();
const tracer = tracerProvider.getTracer("tracer");

export default async function handler(req, res) {
  await tracer.startActiveSpan(
    "data.fetch",
    {
      attributes: {
        "user.email": email || undefined,
        "user.name": name || undefined,
      },
    },
    async (span) => {
      try {
        doSomething();
        throw new Error('Something went wrong!');
      } catch (error) {
        if (span) {
          span.recordException(error);
        }
      }
    },
  );
}
```
This ensures that the error is captured within the OpenTelemetry trace and can be visualized in your tracing backend.

Next.js 15 also introduces a new `onRequestError` [hook that can be used to capture server errors](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional).
You can use it in your `instrumentation.ts` file to intercept all server actions and capture the error:

```typescript

import { type Instrumentation } from 'next'

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const { trace } = await import('@opentelemetry/api')
  const span = trace.getActiveSpan()
  if (span) {
    span.setAttributes({
      'http.url': request.path,
      'http.method': request.method,
      'next.router.kind': context.routerKind,
      'next.router.path': context.routerPath,
      'next.router.type': context.routerType,
      'next.render.source': context.renderSource,
      'next.render.type': context.renderType,
      'next.revalidate.reason': context.revalidateReason,
    })
    span.recordException(err)
  }
}
```

This example reports the error to the current active span, which is the span for the request.

### Exporting Metrics

Next.js applications often benefit from metrics like request count, latency, and errors. Here's how to add instrumentation for request tracking in `otel.ts`:

```typescript
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
```typescript
import { trackRequest } from '../../otel';

export default function handler(req, res) {
  trackRequest();
  res.status(200).json({ message: 'Metrics tracked!' });
}
```

### Putting it all together

Let's put all of the pieces together and create a complete `otel.ts` file that will automatically instrument your Next.js app. Using `@vercel/otel`, we'll configure export for Highlight.io, but you can use any other OpenTelemetry-compatible backend:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SEMRESOURCENAME } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const exporter = new OTLPTraceExporter(config)
const spanProcessor = new BatchSpanProcessor(exporter, opts)

const logsExporter = new OTLPLogExporter(config)
const logProcessor = new BatchLogRecordProcessor(logsExporter, opts)

const metricsExporter = new OTLPMetricExporter(config)
const metricsReader = new PeriodicExportingMetricReader({exporter: metricsExporter})

// Configure the OTLP exporter to send data to your OpenTelemetry backend
const config = { url: 'https://otel.highlight.io:4317' }
const sdk = new NodeSDK({
  autoDetectResources: true,
  resourceDetectors: [processDetectorSync],
  resource: new Resource({
    [SEMRESOURCENAME.SERVICE_NAME]: 'nextjs-app',
    'highlight.project_id': '<YOUR_PROJECT_ID>',
  }),
  spanProcessors: [spanProcessor],
  logRecordProcessors: [logProcessor],
  metricReader: metricReader,
  traceExporter: exporter,
  contextManager: new AsyncLocalStorageContextManager(),
  sampler: new AlwaysOnSampler(),
  instrumentations: [new HttpInstrumentation(), new FetchInstrumentation()],
})

sdk.start();
```

Now, let's use the OpenTelemetry SDK in our route to emit data:

```typescript
import {NextResponse} from "next/server";
import api, {propagation} from "@opentelemetry/api";
import {logs, SeverityNumber} from "@opentelemetry/api-logs";

const tracerProvider = api.trace.getTracerProvider();
const tracer = tracerProvider.getTracer("data");

const loggerProvider = logs.getLoggerProvider();
const logger = provider.getLogger("data");

const meterProvider = api.metrics.getMeterProvider();
const meter = meterProvider.getMeter("data");

// This is an example implementation of a route that fetches data from a Python service
export async function GET() {
    const {email, name} = req.query;

    console.log("Fetching data...", {email});
    const headers = {
        "Content-Type": "application/json",
    };
    propagation.inject(api.context.active(), headers);
    const response = await fetch(
        `https://api.sampleapis.com/coffee/hot`,
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
    const data = await response.json();

    // create a span for data processing that may be complex
    const processed = await tracer.startActiveSpan(
        "data.process",
        {
            attributes: {
                "user.email": email || undefined,
                "user.name": name || undefined,
            },
        },
        async () => {
            // do something that may be slow
            data.map((d) => ({
                ...d,
                calculated: d.value ?? 0 * 1.23
            }))
    });

    // report the data as a metric
    const gauge = meter.createObservableGauge("data.metric");
    for (const d of processed) {
        gauge.addCallback((m) => {
            m.observe(d.attribute);
        });
    }

    // emit a custom log
    logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
        body: "returning data",
        attributes: {processed},
    });

    return NextResponse.json(processed);
}
```

In this full handler example, you can see how to emit a trace, log, and metric using the native OpenTelemetry constructs. It's evident that the API is quite verbose and not simple to work with. For the highlight platform, we've created a [Node.js SDK that wraps OpenTelemetry](https://github.com/highlight/highlight/blob/main/sdk/highlight-node/src/client.ts) to simplify the API streamline data reporting, with simple APIs. For example, here's the same handler using our SDK:


```typescript
import { H } from '@highlight-run/node';

// the Highlight SDK instrumentation can happen in each route
// or globally for the whole application in your `instrumentation.ts` file
H.init('YOUR_PROJECT_ID', {
  // ... options to configure the SDK
});

// This is an example implementation of a route that fetches data from a Python service
export async function GET() {
    const {email, name} = req.query;

    console.log("Fetching data...", {email});
    const response = await fetch(
        `https://api.sampleapis.com/coffee/hot`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email,
            }),
        },
    );
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }
    const data = await response.json();

    // create a span for data processing that may be complex
    const processed = await H.startActiveSpan(
        "data.process",
        async (span) => {
            span.setAttributes({
                "user.email": email || undefined,
                "user.name": name || undefined,
            });
            // do something that may be slow
            data.map((d) => ({
                ...d,
                calculated: d.value ?? 0 * 1.23
            }))
        });

    // report the data as a metric
    for (const d of data) {
        H.recordMetric('data.metric', d.attribute);
    }

    // emit a custom log
    H.log('returning data', {data});

    return NextResponse.json(data);
}
```

### Conclusion

With the full suite of instrumentation configured, you'll start to see valuable data in your Highlight dashboard. 
This data empowers you to enhance your troubleshooting workflows significantly. 

By visualizing response times, error rates, and detailed error reports, 
you can quickly identify performance bottlenecks and areas for improvement. 
For instance, if you notice a spike in response times for a specific API endpoint, 
you can drill down into the traces to see what might be causing the delay. 

Additionally, the error rate metrics allow you to monitor the health of your application in real-time. 
If an increase in errors is detected, you can leverage the detailed error reports to understand 
the context and root cause, enabling you to address issues proactively.

Overall, integrating OpenTelemetry with Highlight not only provides you with observability 
but also equips you with the insights needed to optimize your application and enhance user experience. 
Start leveraging this powerful combination today to take your monitoring and troubleshooting 
capabilities to the next level!

![](/images/blog/nextjs-otel/dashboard.png)

You can see the traces, logs, and metrics in the dashboard and use them to troubleshoot issues and optimize your application.


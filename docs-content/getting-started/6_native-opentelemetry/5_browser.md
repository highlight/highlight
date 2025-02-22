---
title: Browser Instrumentation
slug: browser-otel-instrumentation
heading: OpenTelemetry Browser Instrumentation
metaTitle: Send OpenTelemetry Browser Instrumentation Data to Highlight
createdAt: 2024-09-17T00:00:00.000Z
updatedAt: 2024-09-17T00:00:00.000Z
quickstart: true
---

If you want to send OpenTelemetry data to Highlight from [OTeL's Browser instrumentation](https://opentelemetry.io/docs/languages/js/getting-started/browser/) you can do this by making a couple tweaks to your configuration.

### 1. Add span resource atributes

In order to associate spans with your project and sessions in Highlight, you'll need to add a few attributes:

* `highlight.project_id` - Allows us to associate traces with your project. This can be accessed from [your Highlight account](https://app.highlight.io/setup).
* `highlight.session_id` - Allows us to associate traces with a specific session in your project. This can be accessed as the `sessionSecureID` attribute of the object returned from [H.getSessionData()](https://highlight.io/docs/sdk/client#HgetSessionDetails).
* `service.name` (optional) - Specify the service name you want to assign on your traces. This makes it easier to filter to all traces from this instrumentation.

You can set these attributes when creating your trace provider:

```ts
const provider = new WebTracerProvider({
  resource: new Resource({
    'highlight.project_id': 'your-project-id',
    'highlight.session_id': 'your-session-id',
    'service.name': 'your-service-name', // optional
  })
});
```

### 2. Send data to Highlight's collector

Update your OTeL exporter to send data to the Highlight collector by updating the `url` config attribute:

```ts
const exporter = new OTLPTraceExporter({
  url: 'https://otel.highlight.io/v1/traces',
  // ...
})
```

### 3. Verify data is flowing correctly

Verify data is being sent to Highlight correctly. You can check the network traffic in your browser dev tools to verify requests are being made. If data is flowing you can log into Highlight and go to the Traces page, then filter by `service_name` to the value you sent in the `service.name` attribute to see all traces from the browser instrumentation.

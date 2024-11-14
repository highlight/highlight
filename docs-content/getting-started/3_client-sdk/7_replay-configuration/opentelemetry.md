---
title: Browser OpenTelemetry
slug: opentelemetry
createdAt: 2024-08-23T22:55:19.000Z
updatedAt: 2024-08-23T22:55:19.000Z
---

Highlight's JavaScript SDK offers built-in support for collecting OpenTelemetry data from client-side applications, allowing you to seamlessly integrate OpenTelemetry tracing into your web applications.

Highlight will automatically start collecting OTeL information using all the standard auto instrumentations, including:

* **Document Load Performance:** Captures timing information related to the loading of the web page, including navigation start, DOM content loaded, and page load complete events.
* **User Interactions:** Tracks user actions such as clicks, form submissions, and other interactions with the web page.
* **Network Requests:** Monitors XMLHttpRequest and Fetch API calls, providing insights into the performance and success of network operations.

We also add some custom attributes and configuration to make this data more useful inside the Highlight UI.

## Connecting Server and Client Traces

Requests initiated from your app after the Highlight SDK has initialized will automatically be connected to the traces on the server, giving the full picture of what's happening from mouse click to database call. You can learn more about this in [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping). However, it's a little more complicated connected traces initiated on the server with spans created on the client.

### Passing Trace Context from Server to Client

To connect server and client traces:

1. On the server, generate a trace context (typically a `traceparent` header).
2. Include this trace context in the HTML response as a `<meta>` tag.
3. The Highlight SDK will automatically pick up this trace context and continue the trace on the client side.

Here's an example of how to include the trace context in your HTML:

```html
<meta
  name="traceparent"
  content="00-${traceId}-${spanId}-${samplingDecision ?? '01'}"
>
```

Some SDKs have helpers for generating this HTML. If you are using our Ruby SDK you can simple add the following code somewhere inside the `<head>` of your document.

```rb
<%= highlight_traceparent_meta %>
```

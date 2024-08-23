---
title: Collecting OpenTelemetry Data in Client-Side Applications
slug: salesforce-lwc
createdAt: 2024-08-23T22:55:19.000Z
updatedAt: 2024-08-23T22:55:19.000Z
---

## Collecting OpenTelemetry Data in Client-Side Applications

Highlight.io's JavaScript SDK provides built-in support for collecting OpenTelemetry data from client-side applications. This feature allows you to seamlessly integrate OpenTelemetry tracing into your web applications, providing valuable insights into application performance and user interactions.

### Enabling OpenTelemetry Tracing

To enable OpenTelemetry tracing in your application using the Highlight.io SDK, you need to set the `enableOtelTracing` configuration option when initializing the SDK. The OpenTelemetry browser instrumentation is currently in beta, so you need to explicitly enable it when calling [`H.init`](/docs/sdk/client#Hinit).

```ts
H.init({
  // ...
  enableOtelTracing: true
})
```

## Types of OpenTelemetry Data Collected

When OpenTelemetry tracing is enabled, the Highlight.io SDK automatically collects various types of data using built-in instrumentations. These include:

1. Document Load: Captures timing information about the document load process, including navigation start, DOM content loaded, and load event end times.

2. User Interactions: Records spans for user interactions such as clicks, including details about the target element and the type of interaction.

3. XMLHttpRequest (XHR): Traces outgoing XHR requests, including the URL, method, and timing information.

4. Fetch Requests: Similar to XHR, this captures information about outgoing fetch requests, including URL, method, and timing data.

5. GraphQL Operations: For applications using GraphQL, the SDK can capture and parse GraphQL operations, providing insights into query and mutation performance.

These auto-instrumentations provide a comprehensive view of your application's performance from the client-side perspective, allowing you to identify bottlenecks, track user interactions, and monitor network requests without manual instrumentation.

## Connecting Client and Server Traces

One of the powerful features of OpenTelemetry is the ability to connect traces across different services and environments, including from the client to the server. Highlight.io's SDK facilitates this connection through context propagation. This allows you to create end-to-end traces that span from user interactions in the browser all the way to your backend services.

### Context Propagation

Context propagation is the mechanism by which trace context is passed from one service to another, allowing for the creation of a complete end-to-end trace of a request as it moves through your system. In the case of client-server communication, this means passing trace information from the browser to your backend services.

The Highlight.io SDK automatically handles context propagation for you. Here's how it works:

1. **Trace Initiation**: When a user interaction or a network request is initiated in the browser, the SDK creates a new span or continues an existing trace.

2. **Header Injection**: For outgoing HTTP requests (both XHR and Fetch), the SDK automatically injects trace context headers into the request. These headers typically include:
   - `traceparent`: Contains the trace ID, parent span ID, and trace flags.
   - `tracestate`: Carries vendor-specific trace information.

3. **Server-Side Reception**: The Highlight.io server-side SDKs extract these headers and continue the trace, linking the server-side spans to the client-side trace.

4. **Trace Completion**: As the request completes and returns to the client, the full trace, including both client and server spans, can be visualized in Highlight.io's UI.

### Example

Here's a simplified example of how this works in practice:

1. A user clicks a button in your web application.
2. The Highlight.io SDK creates a span for this user interaction.
3. This interaction triggers an API call to your backend.
4. The SDK automatically injects trace headers into this API call.
5. Your backend receives the request, extracts the trace context, and continues the trace.
6. The backend processes the request and sends a response.
7. The client receives the response and completes the span.

The result is a single trace that shows the complete journey of the request, from the initial user interaction in the browser, through your backend services, and back to the client.

### Benefits

This connection between client and server traces provides several benefits:

- **End-to-End Visibility**: You can trace a user's action all the way through your system, making it easier to diagnose issues and understand performance bottlenecks.
- **Performance Optimization**: By seeing the complete picture, you can identify whether performance issues are occurring on the client-side, server-side, or in the network communication between them.
- **Error Correlation**: If an error occurs, you can see the full context of what led to that error, including any relevant client-side actions or server-side processing.

By leveraging Highlight.io's OpenTelemetry integration, you can gain these insights with minimal configuration, allowing you to focus on improving your application's performance and user experience.

## Connecting Traces Started on the Server

When a request for a page is made by fetching a new URL in the browser we don't have the JS SDK initialized in the browser until the server returns the HTML and renders the page, then fetches all the JS assets to render the app. In this case you pass the trace ID from the server to the client in a `<meta>` tag to handoff the trace initiated on the server to the client.

We still capture all the timing information from the document load instrumentation. This instrumentation parses the `<meta>` tag and associates all the spans it creates with trace data from the tag. Here is a visualization of how this works in a Rails app:

![Flame graph of trace initiated on server and picked up in browser](/images/docs/client-sdk/opentelemetry/server-client-trace-handoff.png)

Here's how to parse what's going on here:

1. The `documentLoad` span shows the full timing from submitting the URL in the browser to be loaded to having all the assets loaded and the page being fully interactive. The timing data for this span is gathered from `window.performance.timing` since we can't actually initiate a span before the JS loads.
2. The `PagesController#home` is the first span created on the server. You can trace the server code execution required to render the HTML that will be returned to the browser. When the HTML is returned to the browser the `documentFetch` span finishes.
3. After the HTML is loaded int he browser you can see the requests for the page's resources (all the JS and CSS files), these are the `resourceFetch` spans.

These resource timings provide a full picture of your app's load time, making it clear where the opportunities are to improve performance and provide a better UX.

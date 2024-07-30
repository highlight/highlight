---
title: Fullstack Mapping
slug: 4_backend-sdk
createdAt: 2022-03-28T20:05:46.000Z
updatedAt: 2022-04-01T20:40:53.000Z
---

## What's this?

In order to make the most out of [highlight.io](https://highlight.io), we suggest instrumenting your frontend and backend so that you can attribute frontend requests with backend errors and logs. See an example below, where you can view an error's details alongside frontend session replay, allowing you to get the full context you need.

![](/images/fullstack-mapping.png)

Below, we detail the requirements to get this working as well as how to troubleshoot.

## How can I start using this?

### Install the client bundle

If you haven't already, you need to install our client javascript bundle in the framework of your choice. Get started below:
<DocsCardGroup>
<DocsCard title="Getting Started (Client)" href="./1_overview.md">
{"Install the `highlight.run` client bundle in your app."}
</DocsCard>
</DocsCardGroup>

### Turn on `tracingOrigins`

Set the `tracingOrigins` option to an array of patterns matching the location of your backend. You may also simply specify `true`, which will default `tracingOrigins` to all subdomains/domains of the url for your frontend app. If your application makes cross-origin requests that you would like to trace, you will have to explicitly include those.

```javascript
H.init("<YOUR_PROJECT_ID>", {
	tracingOrigins: ['localhost', 'example.myapp.com/backend'],
    ...
});
```

### Turn on `networkRecording`

```javascript
H.init("<YOUR_PROJECT_ID>", {
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
	...
});
```

## Backend Changes

Backend changes are dependent on the underlying language/framework used on the server-side codebase. All you need to add is a middleware and code to capture errors.

Below are solutions for what we support today. If you'd like us to support a new framework, feel free to shoot us a message at [support@highlight.io](mailto:support@highlight.io) or drop us a note in our [discord](https://discord.gg/yxaXEAqgwN).

- [Go Backend Integration](4_backend-sdk/go)

- [JS Backend Integration](4_backend-sdk/js)

- [Python Backend Integration](4_backend-sdk/python)

- [Java Backend Integration](4_backend-sdk/java)

## Distributed Tracing

Your backend might be a distributed system with multiple services. Say, for example, a
frontend Next.js application with a Next.js backend ,which makes HTTP requests to
a Python FastAPI microservice. In a case like that, you may want errors and logs from your Python service to be
attributed to the frontend sessions in Highlight.

Our frontend -> backend tracing uses the `x-highlight-request` HTTP header to attribute frontend requests with backend errors and logs. So, in the case of the example above, assuming all of your services have the highlight sdk installed, if your Next.js backend performs an HTTP request to a FastAPI backend and you forward the `x-highlight-request` header along, the trace will carry over information about the frontend session.

```javascript
await fetch('my-fastapi-backend:8000/api', { headers: {'x-highlight-request': request.headers.get(`x-highlight-request`)} })
```

A more complex application might not make HTTP requests between backend services, however. Instead, it may
use a message broker like Kafka to queue up jobs. In that case, you'll need to add a way to
store the `x-highlight-request` you receive from the frontend along with your enqueued messages.
The service that consumes the messages can then pass the value to the highlight SDK via custom
error wrapping or logging code as per usual.

```javascript
// the receiving example references `request.headers`, but this could be read from another service-to-service protocol (ie. gRPC, Apache Kafka message)
const parsed = H.parseHeaders(request.headers)
H.consumeError(error, parsed.secureSessionId, parsed.requestId)
```

## Troubleshooting

1.  Ensure `tracingOrigins` and `networkRecording` are properly set.

2.  Ensure your backend has `CORS` configured for your frontend hostname, explicitly allowing header `x-highlight-request`.

3.  For debugging the backend SDK of your choice, in order to debug, we suggest enabling verbose logging. For example, in Go, add `highlight.SetDebugMode(myLogger)`

4.  If all else fails, please email us at support@highlight.io or join the #support channel on our [discord](https://discord.gg/yxaXEAqgwN).

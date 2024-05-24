---
title: "Tracing Distributed Systems in Next.js"
createdAt: 2024-04-21T12:00:00Z
readingTime: 6
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
tags: Tutorial
metaTitle: "Tracing Distributed Systems in Next.js"
---


[![Watch on YouTube](/images/blog/tracing-distributed-systems-in-nextjs/distributed-tracing-livestream-16x9-play.png)](https://youtube.com/live/z9g-eOPwndk)

## Distributed Tracing

Distributed tracing is crucial for debugging and improving system performance. Instead of looking at the performance of each service in isolation, distributed tracing links traces across services to show how a request flows through a system. For instance, a trace might start in a React web client, pass through a Next.js API, and continue across subsequent HTTP calls, keeping all activities under one umbrella. This not only simplifies tracking but also provides a clear, consolidated view of how different parts of your application interact.

![Distributed tracing flame graph](/images/blog/tracing-distributed-systems-in-nextjs/trace-screenshot-with-callouts.png)

## Approach

In this post, we’ll go over a practical example of how tracing across multiple services work in the context of a modern NextJS application.

Here’s the exact github repo we’ll be pulling the example from:

**[GitHub: Distributed Tracing Example](https://github.com/highlight/distributed-tracing-example)**

We will demonstrate how to use Highlight to connect a NextJS application with an external service by passing HTTP headers in the following steps:


- **Next Client:** The web client initiates an HTTP `Fetch` request, passing the `x-highlight-request` header which contains a generated `sessionId` and `requestId`.
- **Next Server:** A Next.js API function receives that request, associates the `sessionId` and `requestId` to it's local trace, then passes the `x-highlight-request` header to a third service, this time written in Golang.
- **Go Server:** The Golang service receives the `x-highlight-request` header and associates it to the local trace.

## Instrumenting the Next.js web client

Client-side integration is as easy as injecting `<HighlightInit />` into your web app. 

- Inject `<HighlightInit />` once, preferably in a `layout.tsx` file or `_app.tsx` file.
- `<HighlightInit />` accepts props that correspond to the JavaScript SDK's [options arguments](https://www.highlight.io/docs/sdk/client#Hinit).
- Explore Highlight's wide range of [configuration options](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/overview), including 
    - Canvas and WebGL support, 
    - user identification,
    - and privacy and redaction.

```typescript
// app/layout.tsx
import { CONSTANTS } from "../constants";
import { HighlightInit } from "@highlight-run/next/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HighlightInit
        // excludedHostnames={['localhost']}
        projectId={CONSTANTS.ENV.HIGHLIGHT.PROJECT_ID}
        serviceName="my-nextjs-frontend"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
        }}
        debug
      />

      <html lang="en">
        <body>{children}</body>
      </html>
    </>
  );
}
```

### Calling the Next.js API function

We'll use the browser's `Fetch` API to call a Next.js API function. Highlight monkey patches `window.fetch` and adds the `x-highlight-request` header automatically, so use `Fetch` as you normally would.

See the full [list of monkey patches](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/monkey-patches) in our docs.

```jsx
 <button
    onClick={async () => {
        await fetch("/propagation-test");       
    }}
>Trigger propagation</button>
```

### Wrapping Next.js API functions

First, create a wrapper function. The Next.js SDK wrapper functions capture incoming headers and wrap the handler in a custom span named `highlight-run-with-headers`.

In this case, we're using the App Router, so we'll follow the [Next.js App Router Guide](https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js/app-router).

```typescript
// utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from "@highlight-run/next/server";
import { CONSTANTS } from "../../constants";

export const withAppRouterHighlight = AppRouterHighlight({
  projectID: CONSTANTS.ENV.HIGHLIGHT.PROJECT_ID,
});
```

Next, we wrap our `GET` handler function. Note that we wrap our handler function with `withAppRouterHighlight`, and we forward `request.headers` along with the next HTTP request.

The `x-highlight-request` header is only header that matters in this example.

```typescript
// app/propagation-test/route.ts
import { NextRequest } from "next/server";
import { withAppRouterHighlight } from "../_utils/app-router-highlight.config";

export const GET = withAppRouterHighlight(async (request: NextRequest) => {
  console.info("Here: app/propagation-test/route.ts");

  const response = await fetch("http://localhost:3010/test", {
    method: "GET",
    headers: request.headers, // x-highlight-request is the critical header
  });

  const data = await response.text();

  return new Response(data);
});
```

### Configure our Golang service

Highlight supports multiple [Go libraries](https://www.highlight.io/docs/getting-started/backend-sdk/go/overview). In this case we're using the [Highlight chi SDK](https://www.highlight.io/docs/getting-started/backend-sdk/go/chi).

See a [working example of Highlight chi implementation](https://github.com/highlight/distributed-tracing-example/blob/main/service/main.go) on GitHub.

First, we configure the `highlight-go` SDK.


```go
import (
  "github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
  // ...
  highlight.SetProjectID("<YOUR_PROJECT_ID>")
  highlight.Start(
	highlight.WithServiceName("my-app"),
	highlight.WithServiceVersion("git-sha"),
  )
  defer highlight.Stop()
  // ...
}
```

Next we add the Chi middleware.

```go
import (
  highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
)

func main() {
  // ...
  r := chi.NewRouter()
  r.Use(highlightChi.Middleware)
  // ...
}
```

The `highlightChi.Middleware` function will automatically associate the current request with the incoming `x-highlight-request` header.

### W3C traceparent example code

We used the `x-highlight-request` header in this example, but we also tested [OpenTelemetry's native JavaScript Propagation](https://opentelemetry.io/docs/languages/js/propagation/) example using the [W3C traceparent](https://www.w3.org/TR/trace-context/#traceparent-header) header.

Instead of passing `x-highlight-request` header, it is possible to pass a `traceparent` header across HTTP calls. It's a bit involved, but it works great. See the links below for example code:

- [withPropagation](https://github.com/highlight/highlight/blob/e18566beeab5960f14e9e374e148cfef52f5630c/e2e/nextjs/src/app/_utils/app-router-highlight.config.ts#L23): an example wrapper for Next.js
- [GET route](https://github.com/highlight/highlight/blob/e18566beeab5960f14e9e374e148cfef52f5630c/e2e/nextjs/src/app/api/app-router-trace/route.ts#L22): Pass `request.headers` along as before.
- [Golang example](https://github.com/highlight/highlight/blob/e18566beeab5960f14e9e374e148cfef52f5630c/e2e/nextjs/go-service/main.go#L74): Associate the incoming `traceparent` header with a local trace.

### Result

All three services, the web client, the Next.js API function, and the Golang backend, now feed their data to the same Highlight project.

For the purposes of example, we can even visualize this data in our product (and open source application monitoring tool), Highlight! 

This example shows four separate spans, all of which are nested under a single trace. And of course, these traces are accessible from Highlight's Session Replay tab, because the session was generated in the web client and propagated throughout the entire distributed "call stack".

- `highlight-run-with-headers` is generated by the `AppRouterHighlight` wrapper function in Next.js.
- `fetch GET https://localhost:3010/test` is generated by the Next.js `Fetch` request.
- `highlight.chi` is created by Highlight's chi middleware.
- `go-custom-span` is a custom span that we used in our example code for demonstration purposes. It wraps a call to `time.Sleep(1 * time.Second)` to mimic slow code execution.

![Highlight distributed tracing highlight-run-with-headers](/images/blog/tracing-distributed-systems-in-nextjs/highlight-run-with-headers.png)
**highlight-run-with-headers**

![Highlight distributed tracing go-custom-span](/images/blog/tracing-distributed-systems-in-nextjs/go-custom-span.png)
**go-custom-span**

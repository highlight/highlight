---
title: Changelog 26 (11/08)
slug: changelog-26
---

## Client-side network sanitizing

Sanitize your network requests on the client, preventing sensitive data from ever reaching Highlight's servers.

Check out the docs for our web client's [requestResponseSanitizer](https://www.highlight.io/docs/getting-started/browser/replay-configuration/recording-network-requests-and-responses#custom-sanitizing-of-response-and-requests) function.

<EmbeddedVideo 
  src="https://www.loom.com/embed/47ce07c349f14e9aa3fb802b21221167?sid=f034e880-4e45-4477-82e7-cc763dd0378b"
  title="Session Export"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Tracing improvements

We're hard at work on Tracing, building out new features every day.

Check out the latest two features:

1. Traces embedded in Session Replay network requests:
![Network Request Trace](/images/changelog/26/network-request-trace.png)

2. A fresh, new flame graph to better visualize sources of latency:
![Traces Beta](/images/changelog/26/traces-beta.png)

## Next.js tracing support

We continue to roll out improvements to our popular Next.js SDK, prioritizing Vercel support.

Highlight can now consume Next.js's [built-in OpenTelemetry instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry). This means free request/response spans for Next's Node runtime. We've also re-worked our [Next.js SDK docs](https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js/overview) to streamline your integrations.

We have walkthroughs for both the Page and App Routers, as well as details on our Edge Runtime support.


## Java 11 support

We got a request for Java 11 support, so we hopped on it! 

Integrate your Java 11 application with our [Java docs](https://www.highlight.io/docs/getting-started/server/java-other) today.

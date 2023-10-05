---
title: Next.js Overview
slug: overview
heading: Next.js Overview
createdAt: 2023-05-10T00:00:00.000Z
updatedAt: 2023-05-10T00:00:00.000Z
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/Dyoba16wE-o"
  title="Youtube Video Player"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Get started

<DocsCardGroup>
  <DocsCard title="Environment" href="./2_environment.md">
    {"Inject environment variables into Next.js."}
  </DocsCard>
  <DocsCard title="Web Client" href="./3_client.md">
    {"Install Highlight into web layouts."}
  </DocsCard>
  <DocsCard title="Page Router API" href="./4_api-page-router.md">
    {"Instrument Page Router API routes."}
  </DocsCard>
  <DocsCard title="App Router API" href="./5_api-app-router.md">
    {"Instrument App Router API routes."}
  </DocsCard>
  <DocsCard title="Edge Runtime" href="./6_edge-runtime.md">
    {"Instrument Edge runtime API routes."}
  </DocsCard>
  <DocsCard title="SSR Error Handlers" href="./7_ssr-error-handlers.md">
    {"Report SSR errors to Highlight."}
  </DocsCard>
  <DocsCard title="Configuration" href="./8_configuration.md">
    {"Advanced configuration tips"}
  </DocsCard>
</DocsCardGroup>

## How Highlight captures Next.js errors

|              | Page Router           | App Router           |
|--------------|-----------------------|----------------------|
| API Errors   | `PageRouterHighlight` | `AppRouterHighlight` |
| SSR Errors   | `pages/_error.tsx`    | `app/error.tsx`      |
| Client       | `<HighlightInit />`   | `<HighlightInit />`  |
| Edge runtime | `EdgeHighlight`       | `EdgeHighlight`      |

Our Next.js SDK gives you access to frontend session replays and server-side monitoring,
all-in-one. 

1. On the frontend, the `<HighlightInit/>` component sets up client-side session replays.
2. On the backend, the `PageRouterHighlight` wrapper exported from `@highlight-run/next/server` captures server-side errors and logs from Page Router API endpoints.
3. On the backend, the `AppRouterHighlight` wrapper exported from `@highlight-run/next/app-router` captures errors and logs from App Router API endpoints.
3. The `EdgeHighlight` wrapper exported from `@highlight-run/next/server` captures server-side errors and logs from both Page and App Router endpoints using Vercel's Edge runtime.
4. Use `pages/_error.tsx` and `app/error.tsx` to forward Page Router and App Router SSR errors from the client to Highlight.
5. The `withHighlightConfig` configuration wrapper automatically proxies Highlight data to bypass ad-blockers and uploads source maps so your frontend errors include stack traces to your source code.

## How Highlight captures Next.js logs

`<HighlightInit />` captures front-end logs.

`PageRouterHighlight` and `AppRouterHighlight` capture server-side logs in traditional server runtimes. These wrappers typically fail in serverless runtimes (including Vercel), because we cannot guarantee that the serverless process will stay alive long enough to send all log data to Highlight.

Configure logging for your serverless cloud provider using one of our [cloud provider logging guides](https://www.highlight.io/docs/getting-started/backend-logging/hosting/overview), including [Vercel Log Drain for Highlight](https://vercel.com/integrations/highlight).


---
title: Advanced Config
slug: advanced-config
heading: Next.js Advanced Config
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

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

## Environment variables

> This section is extra opinionated about Next.js constants. It's not for everyone. We like how `zod` and TypeScript work together to validate `process.env` inputs... but this is a suggestion. Do your own thing and replace our imports (`import { CONSTANTS } from 'src/constants'`) with your own!

1. Install Zod: `npm install zod`
2. Edit `.env` to add your projectID to `NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID`

```bash
# .env
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID='<API KEY>'
```

3. Feed your environment variables into the application with a constants file. We're using `zod` for this example, because it creates a validated, typed `CONSTANTS` object that plays nicely with TypeScript.

```javascript
// constants.ts
import { z } from 'zod';

// Must assign NEXT_PUBLIC_* env vars to a variable to force Next to inline them
const publicEnv = {
	NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
};

export const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
	})
	.parse(publicEnv);
```

## Vercel Log Drain

Install our [Vercel + Highlight Integration](https://vercel.com/integrations/highlight) to enable Vercel Log Drain on your project. 

Our API wrappers automatically send logs to Highlight in all runtime environments, but Vercel shuts down its Node.js and Edge processes so quickly that log messages are often lost. 

Vercel Log Drain is a reliable way to capture those logs.

## Next.js plugin

Proxy your front-end Highlight calls by adding `withHighlightConfig` to your `next.config`. Frontend session recording and error capture data will be piped through your domain on `/highlight-events` to sneak Highlight network traffic past ad-blockers.

The following example demonstrates both private source maps and the request proxy. `withHighlightConfig` does not require a second argument if you are only using the request proxy.

### Request proxy only

```javascript
// next.config.js
const { withHighlightConfig } = require('@highlight-run/next/config')

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@highlight-run/node'],
	},
	productionBrowserSourceMaps: true, // optionally ship source maps to production
}

module.exports = withHighlightConfig(nextConfig)
```

### Private source maps + request proxy

1. Get your Highlight API key from your [project settings](https://app.highlight.io/settings/errors#sourcemaps). You can also enable the [Highlight + Vercel integration](https://vercel.com/integrations/highlight) to inject `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` directly into your Vercel environment.

2. Verify that `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY=<apiKey>` is set in your environment variables--try `.env.local` for testing purposes--or pass `apiKey` in as an optional argument to `withHighlightConfig`.

3. Ensure that `productionBrowserSourceMaps` is either `false` or omitted.

4. Wrap your `nextConfig` with `withHighlightConfig`. `apiKey` is unnecessary if you have `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` in your environment variables.

5. Run `npm run build && npm run start` to test. Your logs should show files uploading like so:

```
Uploaded /root/dev/highlight/next-test/.next/server/pages/index.js
```

```javascript
// next.config.js
const { withHighlightConfig } = require('@highlight-run/next/config')

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@highlight-run/node'],
	},
	productionBrowserSourceMaps: false,
}

module.exports = withHighlightConfig(nextConfig, {
	apiKey: '<API KEY>',
	uploadSourceMaps: true,
})
```

## Configure `inlineImages`

We use a package called [rrweb](https://www.rrweb.io/) to record web sessions. rrweb supports inlining images into sessions to improve replay accuracy, so that images that are only available from your local network can be saved; however, the inlined images can cause CORS issues in some situations.

We currently default `inlineImages` to `true` on `localhost`. Explicitly set `inlineImages={false}` if you run into trouble loading images on your page while Highlight is running. This will degrade tracking on `localhost` and other domains that are inaccessible to `app.highlight.io`.

## Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details on how to associate your back-end errors to client sessions.
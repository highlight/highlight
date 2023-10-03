---
title: Next.js Configuration
slug: configuration
heading: Next.js Configuration
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Vercel Log Drain

Install our [Vercel + Highlight Integration](https://vercel.com/integrations/highlight) to enable Vercel Log Drain on your project. 

Our API wrappers automatically send logs to Highlight in all runtime environments, but Vercel shuts down its Node.js and Edge processes so quickly that log messages are often lost. 

Vercel Log Drain is a reliable way to capture those logs.

## Private Source maps and Request Proxying (optional)

Proxy your front end Highlight calls by adding `withHighlightConfig` to your next config. Frontend session recording and error capture data will be piped through your domain on `/highlight-events` to sneak Highlight network traffic past ad-blockers.

1. Wrap the config with `withHighlightConfig`.

If you use a `next.config.js` file:

```javascript
// next.config.js
const { withHighlightConfig } = require('@highlight-run/next/config')

/** @type {import('next').NextConfig} */
const nextConfig = {
	productionBrowserSourceMaps: true,
}

module.exports = withHighlightConfig(nextConfig)
```

If you use a `next.config.mjs` file:

```javascript
// next.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { withHighlightConfig } from '@highlight-run/next/server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = withHighlightConfig({
	productionBrowserSourceMaps: true,
})

export default nextConfig
```

## Configure `inlineImages`

We use a package called [rrweb](https://www.rrweb.io/) to record web sessions. rrweb supports inlining images into sessions to improve replay accuracy, so that images that are only available from your local network can be saved; however, the inlined images can cause CORS issues in some situations.

We currently default `inlineImages` to `true` on `localhost`. Explicitly set `inlineImages={false}` if you run into trouble loading images on your page while Highlight is running. This will degrade tracking on `localhost` and other domains that are inaccessible to `app.highlight.io`.

## Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details on how to associate your back-end errors to client sessions.

## Source map validation

```hint
Source maps work differently in development mode than in production. Run `yarn build && yarn start` to test compiled source maps in Highlight.
```

We recommend shipping your source maps to your production server. Your client-side JavaScript is always public, and code decompilation tools are so powerful that obscuring your source code may not be helpful.

Shipping source maps to production with Next.js is as easy as setting `productionBrowserSourceMaps: true` in your `nextConfig`. Alternatively, you can upload source maps directly to Highlight using our `withHighlightConfig` function.


```javascript
// next.config.js
const { withHighlightConfig } = require('@highlight-run/next/server')

/** @type {import('next').NextConfig} */
const nextConfig = {
	productionBrowserSourceMaps: false
}

module.exports = withHighlightConfig(nextConfig)
```

You must export your `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` to your build process. If you're building and deploying with Vercel, try our [Highlight Vercel Integration](https://vercel.com/integrations/highlight) to inject `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` automatically.

<AutoplayVideo description="Sourcemap upload api key" src="https://user-images.githubusercontent.com/878947/235971066-def65bcb-1580-4e8a-9d69-3e5556d51b27.webm" />

## Instrumentation.ts

Next.js comes out of the box instrumented for Open Telemetry, but support can be spotty depending on your runtime. This example Highlight implementation uses Next's [experimental instrumentation feature](https://nextjs.org/docs/advanced-features/instrumentation) to configure Open Telemetry on a Next.js server.

1.  Turn on `experimental.instrumentationHook`. We've also turned on `productionBrowserSourceMaps` because Highlight is much easier to use with source maps. Notice that we're transpiling the `@highlight-run/next/client` package.

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: true,
}

module.exports = nextConfig
```

2. Create `instrumentation.ts` at the root of your project as explained in the [instrumentation guide](https://nextjs.org/docs/advanced-features/instrumentation). Call `registerHighlight` from within the exported `register` function:

```javascript
// instrumentation.ts
import CONSTANTS from '@/app/constants'
import { registerHighlight } from '@highlight-run/next/server'

export async function register() {
	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	})
}
```

4. If you're using App Router, re-export `/instrumentation.ts` from `src/instrumentation.ts` to enable for App Router.

```typescript
// https://github.com/vercel/next.js/discussions/48273
// src/instrumentation.ts:
export { register } from '../instrumentation'
```

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

## Private source maps and Request proxying (optional)

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
Source maps work differently in development mode than in production. Run `npm run build && npm run start` to test compiled source maps in Highlight.
```

We recommend shipping source maps to your production server. Your client-side JavaScript is always public, and code decompilation tools are so powerful that obscuring your source code may not be helpful.

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

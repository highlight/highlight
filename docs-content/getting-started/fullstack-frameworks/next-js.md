---
title: Next.js Walkthrough
slug: next-js
heading: Next.js Walkthrough
createdAt: 2023-05-10T00:00:00.000Z
updatedAt: 2023-05-10T00:00:00.000Z
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/Dyoba16wE-o"
  title="Youtube Video Player"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Overview

Our Next.js SDK gives you access to frontend session replays and server-side monitoring,
all-in-one. 

1. On the frontend, the `<HighlightInit/>` component sets up client-side session replays.
2. On the backend, the `withHighlight` wrapper captures server-side errors and logs from your API.
3. The `withHighlightConfig` configuration wrapper automatically proxies highlight data to bypass ad-blockers and uploads source maps so your frontend errors include stack traces to your source code.

## Installation

```shell
# with yarn
yarn add @highlight-run/next @highlight-run/react highlight.run
```

## Client Instrumentation

This implementation requires React 17 or greater. If you're behind on React versions, follow our [React.js docs](../3_client-sdk/1_reactjs.md)

1. For the `/pages` directory, you'll want to add `HighlightInit` to `_app.tsx`.

```javascript
// pages/_app.tsx
import { AppProps } from 'next/app'
import CONSTANTS from '@/app/constants'
import { HighlightInit } from '@highlight-run/next/highlight-init'

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<HighlightInit
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
				backendUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL}
			/>

			<Component {...pageProps} />
		</>
	)
}
```

2. For Next.js 13 App Directory, add `HighlightInit` to your `layout.tsx` file.

```javascript
// src/app/layout.tsx
import './globals.css'

import CONSTANTS from '@/app/constants'
import { HighlightInit } from '@highlight-run/next/highlight-init'

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HighlightInit
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
				backendUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL}
			/>

			<html lang="en">
				<body>{children}</body>
			</html>
		</>
	)
}
```

## API Route Instrumentation
1. Create a file to export your `Highlight` wrapper function:

 ```javascript
// src/app/utils/highlight.config.ts:
import CONSTANTS from '@/app/constants'
import { Highlight } from '@highlight-run/next'

export const withHighlight = Highlight({
	projectID: '<YOUR_PROJECT_ID>',
})
 ```

2. Wrap your `/pages/api` functions with `withHighlight`:

```typescript
// pages/api/test.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withHighlight } from '@/app/utils/highlight.config'

export default withHighlight(function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	console.info('Here: /api/app-directory-test', { success })

	if (Math.random() < 0.8) {
		res.send('Success: /api/app-directory-test')
	} else {
		throw new Error('Error: /api/app-directory-test')
	}
})
```

## Server Instrumentation

```hint
Excluding the Vercel edge runtime (which is a work in progress), Session Replay, Vercel Log Drain and Error Monitoring are fully operational for Next.js 13 App Directory
```

Next.js comes out of the box instrumented for Open Telemetry. Our example Highlight implementation will use Next's [experimental instrumentation feature](https://nextjs.org/docs/advanced-features/instrumentation) to configure Open Telemetry on our Next.js server. There are probably other ways to configure Open Telemetry with Next, but this is our favorite.

Adding the `withHighlightConfig` to your next config will configure highlight frontend proxying. This means that frontend session recording and error capture data will be piped through your domain on `/highlight-events` to avoid ad-blockers from stopping this traffic.

1. Install `next-build-id` with `npm install next-build-id`.
2. Turn on `instrumentationHook`.
3. Wrap the config with `withHighlightConfig`.

If you use a `next.config.js` file:

```javascript
// next.config.js
const nextBuildId = require('next-build-id')
const { withHighlightConfig } = require('@highlight-run/next')

/** @type {import('next').NextConfig} */
const nextConfig = {
	generateBuildId: () => nextBuildId({ dir: __dirname }),
	experimental: {
		appDir: true,
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: true,
}

module.exports = withHighlightConfig(nextConfig)
```

If you use a `next.config.mjs` file:

```javascript
// next.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import nextBuildId from 'next-build-id'
import { withHighlightConfig } from '@highlight-run/next'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = withHighlightConfig({
	generateBuildId: () => nextBuildId({ dir: __dirname }),
	experimental: {
		appDir: true,
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: true,
})

export default nextConfig
```

3. Create `instrumentation.ts` at the root of your project as explained in the [instrumentation guide](https://nextjs.org/docs/advanced-features/instrumentation). Call `registerHighlight` from within the exported `register` function:

```javascript
// instrumentation.ts
import CONSTANTS from '@/app/constants'

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		/** Conditional import required for use with Next middleware to avoid a webpack error 
         * https://nextjs.org/docs/pages/building-your-application/routing/middleware */
		const { registerHighlight } = await import('@highlight-run/next')

		registerHighlight({
			projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		})
	}
}
```

4. If you're using the App Router, copy `instrumentation.ts` to `src/instrumentation.ts`. See this [Next.js discussion](https://github.com/vercel/next.js/discussions/48273#discussioncomment-5587441) regarding `instrumentation.ts` with App Router. You could also simply export the `register` function from `instrumentation.ts` in `src/instrumentation.ts` like so:

```javascript
// src/instrumentation.ts:
export { register } from '../instrumentation'
```

## Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

You likely want to associate your back-end errors to client sessions.

## Source Map Validation

```hint
Source maps work differently in development mode than in production. Run `yarn build && yarn start` to test compiled source maps in Highlight.
```

We recommend shipping your source maps to your production server. Your client-side JavaScript is always public, and code decompilation tools are so powerful that obscuring your source code may not be helpful.

Shipping source maps to production with Next.js is as easy as setting `productionBrowserSourceMaps: true` in your `nextConfig`. Alternatively, you can upload source maps directly to Highlight using our `withHighlightConfig` function.

Make sure to implement `nextConfig.generateBuildId` so that our source map uploader can version your source maps correctly.

```javascript
// next.config.js
const nextBuildId = require('next-build-id')
const { withHighlightConfig } = require('@highlight-run/next')

/** @type {import('next').NextConfig} */
const nextConfig = {
	generateBuildId: () => nextBuildId({ dir: __dirname }),
	experimental: {
		appDir: true,
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: false
}

module.exports = withHighlightConfig(nextConfig)
```

You must export your `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` to your build process. If you're building and deploying with Vercel, try our [Highlight Vercel Integration](https://vercel.com/integrations/highlight) to inject `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` automatically.

<AutoplayVideo description="Sourcemap upload api key" src="https://user-images.githubusercontent.com/878947/235971066-def65bcb-1580-4e8a-9d69-3e5556d51b27.webm" />

## Vercel Log Drain

Vercel Log Drain works great. Install our [Vercel + Highlight Integration](https://vercel.com/integrations/highlight) to enable it.

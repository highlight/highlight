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
2. On the backend, the `withHighlight` wrapper captures server-side errors and logs from Page Router API endpoints.
3. On the backend, `instrumentation.ts` and `registerHighlight` capture Page Router SSR errors and App Router API endpoint errors.
4. The `withHighlightConfig` configuration wrapper automatically proxies Highlight data to bypass ad-blockers and uploads source maps so your frontend errors include stack traces to your source code.

### How Highlight captures Next.js errors

|              | Page Router         | App Router          |
|--------------|---------------------|---------------------|
| API Errors   | `withHighlight`     | `instrumentation.ts`|
| SSR Errors   | `instrumentation.ts`| `error.tsx`         |
| Client       | `<HighlightInit />` | `<HighlightInit />` |

## Installation

```shell
# with yarn
yarn add @highlight-run/next
```

## Environment Configuration (optional)

> This section is extra opinionated about Next.js constants. It's not for everyone. We like how `zod` and TypeScript work together to validate `process.env` inputs... but this is a suggestion. Do your own thing and replace our imports (`import CONSTANTS from '@/app/constants'`) with your own!

1. Install Zod: `yarn add zod`
2. Edit `.env` to add your projectID to `NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID`

```bash
# .env
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID='1jdkoe52'
```

3. Feed your environment variables into the application with a constants file. We're using `zod` for this example, because it creates a validated, typed `CONSTANTS` object that plays nicely with TypeScript.

```javascript
// src/app/constants.ts
import { z } from 'zod'

// Must assign NEXT_PUBLIC_* env vars to a variable to force Next to inline them
const publicEnv = {
	NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID:
		process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
}

const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
	})
	.parse(publicEnv)

export default CONSTANTS
```

## Client Instrumentation

This sections adds session replay and frontend error monitoring to Highlight. This implementation requires React 17 or greater. If you're behind on React versions, follow our [React.js docs](../3_client-sdk/1_reactjs.md)

1. For the `/pages` directory, you'll want to add `HighlightInit` to `_app.tsx`.

```javascript
// pages/_app.tsx
import { AppProps } from 'next/app'
import CONSTANTS from '@/app/constants'
import { HighlightInit } from '@highlight-run/next/client'

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<HighlightInit
				excludedHostnames={['localhost']}
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
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
import { HighlightInit } from '@highlight-run/next/client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HighlightInit
				excludedHostnames={['localhost']}
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
			/>

			<html lang="en">
				<body>{children}</body>
			</html>
		</>
	)
}
```

3. Optionally add a React [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

```javascript
// src/app/components/error-boundary.tsx
'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	const isLocalhost =
		typeof window === 'object' && window.location.host === 'localhost'

	return (
		<HighlightErrorBoundary showDialog={!isLocalhost}>
			{children}
		</HighlightErrorBoundary>
	)
}
```

### Skip Localhost tracking

```hint
We do not recommend enabling this while integrating Highlight for the first time because it will prevent you from validating that your local build can send data to Highlight.
```

In the case that you don't want local sessions being shipped to Highlight The `excludedHostnames` prop accepts an array of partial or full hostnames. For example, if you pass in `excludedHostnames={['localhost', 'staging]}`, you'll block `localhost` on all ports, `www.staging.highlight.io` and `staging.highlight.com`.

Alternatively, you could manually call `H.start()` and `H.stop()` to manage invocation on your own.

```javascript
// src/app/layout.tsx
<HighlightInit
	manualStart
	projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
/>
<CustomHighlightStart />

// src/app/custom-highlight-start.tsx
'use client'
import { H } from '@highlight-run/next/client'

export function CustomHighlightStart() {
	useEffect(() => {
		const shouldStartHighlight = window.location.hostname === 'https://www.highlight.io'

		if (shouldStartHighlight) {
			H.start();

			return () => {
				H.stop()
			}
		}
	})

	return null
}
```

## API Route Instrumentation (Page Router)

```hint
This section applies to Next.js Page Router routes only. Each Page Router route must be wrapped individually. We'll address App Router routes later in this walkthrough. Look for `instrumentation.ts`
```

1. Create a file to export your `Highlight` wrapper function:

 ```javascript
// src/app/utils/highlight.config.ts:
import CONSTANTS from '@/app/constants'
import { Highlight } from '@highlight-run/next/server'

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

## Server Instrumentation (App Router)

```hint
This section applies to Next.js App Router routes only (Next 13+). Excluding the Vercel edge runtime (which is a work in progress) and edge function logs, this section will cover all of your error monitoring and logging needs for NextJS. If you do require those logs, we recommend the [Vercel Log Drain](../backend-logging/5_hosting/vercel.md).
```

This section adds server-side error monitoring and log capture to Highlight. 

Next.js comes out of the box instrumented for Open Telemetry. Our example Highlight implementation will use Next's [experimental instrumentation feature](https://nextjs.org/docs/advanced-features/instrumentation) to configure Open Telemetry on our Next.js server. There are probably other ways to configure Open Telemetry with Next, but this is our favorite.


1. Create `instrumentation.ts` at the root of your project as explained in the [instrumentation guide](https://nextjs.org/docs/advanced-features/instrumentation). Call `registerHighlight` from within the exported `register` function.

```javascript
// instrumentation.ts
import CONSTANTS from '@/app/constants'

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		/** Conditional import required for use with Next middleware to avoid a webpack error 
         * https://nextjs.org/docs/pages/building-your-application/routing/middleware */
		const { registerHighlight } = await import('@highlight-run/next/server')

		registerHighlight({
			projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		})
	}
}
```

2. If you're using the App Router, copy `instrumentation.ts` to `src/instrumentation.ts`. See this [Next.js discussion](https://github.com/vercel/next.js/discussions/48273#discussioncomment-5587441) regarding `instrumentation.ts` with App Router. You could also simply export the `register` function from `instrumentation.ts` in `src/instrumentation.ts` like so:

```javascript
// src/instrumentation.ts:
export { register } from '../instrumentation'
```

## `error.tsx` (App Router)

`instrumentation.ts` does not catch SSR errors from the App Router. App Router instead uses [error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) to send server-side rendering errors to the client. We can catch and consume those error with a custom error page.

These error will display as client errors, even though we know that they're 

```javascript
// src/app/error.tsx
'use client' // Error components must be Client Components

import { H } from '@highlight-run/next/client'
import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Log the error to Highlight
		H.consumeError(error)
	}, [error])

	return (
		<div>
			<h2>Something went wrong!</h2>
			<button
				onClick={
					// Attempt to recover by trying to re-render the segment
					() => reset()
				}
			>
				Try again
			</button>
		</div>
	)
}
```



## Private Sourcemaps and Request Proxying (optional)

Adding the `withHighlightConfig` to your next config will configure highlight frontend proxying. This means that frontend session recording and error capture data will be piped through your domain on `/highlight-events` to avoid ad-blockers from stopping this traffic.

1. Install `next-build-id` with `npm install next-build-id`.
2. Turn on `instrumentationHook`.
3. Wrap the config with `withHighlightConfig`.

If you use a `next.config.js` file:

```javascript
// next.config.js
const nextBuildId = require('next-build-id')
const { withHighlightConfig } = require('@highlight-run/next/server')

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
import { withHighlightConfig } from '@highlight-run/next/server'

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


## Configure `inlineImages`

We use a package called [rrweb](https://www.rrweb.io/) to record web sessions. rrweb supports inlining images into sessions to improve replay accuracy, so that images that are only available from your local network can be saved; however, the inlined images can cause CORS issues in some situations.

We currently default `inlineImages` to `true` on `localhost`. Explicitly set `inlineImages={false}` if you run into trouble loading images on your page while Highlight is running. This will degrade tracking on localhost and other domains that are inaccessible to `app.highlight.io`.

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
const { withHighlightConfig } = require('@highlight-run/next/server')

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

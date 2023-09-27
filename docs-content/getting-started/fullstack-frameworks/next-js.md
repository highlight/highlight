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
2. On the backend, the `PageRouterHighlight` wrapper exported from `@highlight-run/next/server` captures server-side errors and logs from Page Router API endpoints.
3. On the backend, the `AppRouterHighlight` wrapper exported from `@highlight-run/next/app-router` captures errors and logs from App Router API endpoints.
3. The `EdgeHighlight` wrapper exported from `@highlight-run/next/server` captures server-side errors and logs from both Page and App Router endpoints using Vercel's Edge runtime.
4. Use `pages/_error.tsx` and `app/error.tsx` to forward Page Router and App Router SSR errors from the client to Highlight.
5. The `withHighlightConfig` configuration wrapper automatically proxies Highlight data to bypass ad-blockers and uploads source maps so your frontend errors include stack traces to your source code.

### How Highlight captures Next.js errors

|              | Page Router           | App Router           |
|--------------|-----------------------|----------------------|
| API Errors   | `PageRouterHighlight` | `AppRouterHighlight` |
| SSR Errors   | `pages/_error.tsx`    | `app/error.tsx`      |
| Client       | `<HighlightInit />`   | `<HighlightInit />`  |
| Edge runtime | `EdgeHighlight`       | `EdgeHighlight`      |

### How Highlight captures Next.js logs

`<HighlightInit />` captures front-end logs.

`PageRouterHighlight` and `AppRouterHighlight` capture server-side logs in traditional server runtimes. These wrappers typically fail in serverless runtimes (including Vercel), because we cannot guarantee that the serverless process will stay alive long enough to send all log data to Highlight.

Configure logging for your serverless cloud provider using one of our [cloud provider logging guides](https://www.highlight.io/docs/getting-started/backend-logging/hosting/overview), including [Vercel Log Drain for Highlight](https://vercel.com/integrations/highlight).



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
				serviceName="my-nextjs-frontend"
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
				serviceName="my-nextjs-frontend"
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

In the case that you don't want local sessions being shipped to Highlight, the `excludedHostnames` prop accepts an array of partial or full hostnames. For example, if you pass in `excludedHostnames={['localhost', 'staging]}`, you'll block `localhost` on all ports, `www.staging.highlight.io` and `staging.highlight.com`.

Alternatively, you could manually call `H.start()` and `H.stop()` to manage invocation on your own.

```javascript
// src/app/layout.tsx
<HighlightInit
	manualStart
	projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
	serviceName="my-nextjs-frontend"
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
This section applies to Next.js Page Router routes only. Each Page Router route must be wrapped individually.
```

1. Create a file to export your `PageRouterHighlight` wrapper function:

 ```javascript
// src/app/utils/page-router-highlight.config.ts:
import CONSTANTS from '@/app/constants'
import { PageRouterHighlight } from '@highlight-run/next/server'

export const withPageRouterHighlight = PageRouterHighlight({
	projectID: '<YOUR_PROJECT_ID>',
})
 ```

2. Wrap your `/pages/api` functions with `withPageRouterHighlight`:

```typescript
// pages/api/test.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '@/app/utils/page-router-highlight.config'

export default withPageRouterHighlight(function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	console.info('Here: pages/api/test.ts')

	if (Math.random() < 0.8) {
		res.send('Success: pages/api/test.ts')
	} else {
		throw new Error('Error: pages/api/test.ts')
	}
})
```

## API Route Instrumentation (App Router)

```hint
This section applies to Next.js App Router routes only. Each App Router route must be wrapped individually.
```

1. Create a file to export your `AppRouterHighlight` wrapper function:

```typescript
// src/app/utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from '@highlight-run/next/server'
import CONSTANTS from '@/app/constants'

export const withAppRouterHighlight = AppRouterHighlight({
	projectID: '<YOUR_PROJECT_ID>',
})

```

2. Wrap your `/app` functions with `withAppRouterHighlight`: 

```typescript
import { NextRequest } from 'next/server'
import { withAppRouterHighlight } from '@/app/utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
	console.info('Here: /api/app-directory-test/route.ts')

	if (Math.random() < 0.8) {
		return new Response('Success: /api/app-directory-test')
	} else {
		throw new Error('Error: /api/app-directory-test (App Router)')
	}
})
```

## Vercel Edge Runtime Instrumentation

1. Create a file to export your `EdgeHighlight` wrapper function:

```typescript
// src/app/utils/edge-highlight.config.ts:
import { EdgeHighlight } from '@highlight-run/next/server'

export const withEdgeHighlight = EdgeHighlight({
	projectID: '<YOUR_PROJECT_ID>',
})
```

2. Wrap your edge function with `withEdgeHighlight`

```typescript
import type {  NextRequest } from 'next/server'
import { withEdgeHighlight } from '@/app/utils/edge-highlight.config'

import { NextResponse } from 'next/server'

export const GET = withEdgeHighlight(async function GET(request: NextRequest) {
	console.info('Here: /api/edge-test/route.ts')

	if (Math.random() < 0.8) {
		return new Response('Success: /api/edge-test')
	} else {
		throw new Error('Error: /api/edge-test (Edge Runtime)')
	}
})

export const runtime = 'edge'
```

## `pages/_error.tsx` (Page Router)

Page Router uses [pages/_error.tsx](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#more-advanced-error-page-customizing) to send server-side render errors to the client. We can catch and consume those error with a custom error page.

These errors will display as client errors, even though we know that they're server errors.

```javascript
// pages/_error.tsx
import NextError from 'next/error'
import {
	H,
	getHighlightErrorInitialProps,
	HighlightErrorProps,
} from '@highlight-run/next/client'
import CONSTANTS from '@/app/constants'

export default function CustomError({
	errorMessage,
	statusCode,
}: HighlightErrorProps) {
	H.init(CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID)
	H.consumeError(new Error(errorMessage))

	return <NextError statusCode={statusCode} /> // Render default Next error page
}

CustomError.getInitialProps = getHighlightErrorInitialProps
```

## `app/error.tsx` (App Router)

App Router uses [app/error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) to send server-side render errors to the client. We can catch and consume those error with a custom error page.

These errors will display as client errors, even though we know that they're server errors.

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
		H.consumeError(error) // Log the error to Highlight
	}, [error])

	return (
		<div>
			<h2>Something went wrong!</h2>
			<button
				onClick={
					() => reset() // Attempt to recover by trying to re-render the segment
				}
			>
				Try again
			</button>
		</div>
	)
}
```
## Private Sourcemaps and Request Proxying (optional)

Proxy your front end Highlight calls by adding `withHighlightConfig` to your next config. Frontend session recording and error capture data will be piped through your domain on `/highlight-events` to sneak Highlight network traffic past ad-blockers.

1. Wrap the config with `withHighlightConfig`.

If you use a `next.config.js` file:

```javascript
// next.config.js
const { withHighlightConfig } = require('@highlight-run/next/server')

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
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
import { withHighlightConfig } from '@highlight-run/next/server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = withHighlightConfig({
	experimental: {
		appDir: true,
	},
	productionBrowserSourceMaps: true,
})

export default nextConfig
```


## Configure `inlineImages`

We use a package called [rrweb](https://www.rrweb.io/) to record web sessions. rrweb supports inlining images into sessions to improve replay accuracy, so that images that are only available from your local network can be saved; however, the inlined images can cause CORS issues in some situations.

We currently default `inlineImages` to `true` on `localhost`. Explicitly set `inlineImages={false}` if you run into trouble loading images on your page while Highlight is running. This will degrade tracking on `localhost` and other domains that are inaccessible to `app.highlight.io`.

## Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details on how to associate your back-end errors to client sessions.

## Source Map Validation

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
	experimental: {
		appDir: true,
	},
	productionBrowserSourceMaps: false
}

module.exports = withHighlightConfig(nextConfig)
```

You must export your `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` to your build process. If you're building and deploying with Vercel, try our [Highlight Vercel Integration](https://vercel.com/integrations/highlight) to inject `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` automatically.

<AutoplayVideo description="Sourcemap upload api key" src="https://user-images.githubusercontent.com/878947/235971066-def65bcb-1580-4e8a-9d69-3e5556d51b27.webm" />

## Vercel Log Drain

Vercel Log Drain works great. Install our [Vercel + Highlight Integration](https://vercel.com/integrations/highlight) to enable it.

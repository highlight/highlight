---
title: Next.js
slug: next-js
heading: Next.js Walkthrough
createdAt: 2023-05-10T00:00:00.000Z
updatedAt: 2023-05-10T00:00:00.000Z
---

## Limitations 

⚠️ We are working on App Directory support. App Directory has not reached feature-parity with standard Next, so we're waiting for a stable release to lock down our integration. We're capturing App Directory API errors, but we've been unable to capture server-side errors from App Directory routes.

⚠️ Sourcemaps do not work in development mode. Run `yarn build && yarn start` to test compiled source maps in Highlight.

## Installation

```shell
# with npm
npm install @highlight-run/next @highlight-run/react highlight.run

# with yarn
yarn add @highlight-run/next @highlight-run/react highlight.run
```

## Environment Configuration (Very optional)

> This section is extra opinionated about Next.js constants. It's not for everyone. We like how `zod` and TypeScript work together to validate `process.env` inputs... but this is a suggestion. Do your own thing!

1. Edit `.env` to add your projectID to `NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID`
2. To send data to a locally-running instance of Highlight, create `.env.local` at your project root with variables for your local `otlpEndpoint` and `backendUrl`:

```bash
# .env.local
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID='1jdkoe52'

# omit to send data to app.highlight.io
NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT='http://localhost:4318' 
NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL='https://localhost:8082/public'
```

3. Feed your environment variables into the application with a constants file. We're using `zod` for this example, because it creates a validated, typed `CONSTANTS` object that plays nicely with TypeScript.

```javascript
// src/app/constants.ts
import { z } from 'zod'

const stringOrUndefined = z.preprocess(
	(val) => val || undefined,
	z.string().optional(),
)

// Must assign NEXT_PUBLIC_* env vars to a variable to force Next to inline them
const publicEnv = {
	NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID:
		process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT:
		process.env.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL:
		process.env.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL,
}

const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
		NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT: stringOrUndefined,
		NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL: stringOrUndefined,
	})
	.parse(publicEnv)

export default CONSTANTS
```

## Instrument your API routes
 1. Create a file to export your `Highlight` wrapper function:

 ```javascript
// src/app/utils/highlight.config.ts:
import CONSTANTS from '@/app/constants'
import { Highlight } from '@highlight-run/next'

if (process.env.NODE_ENV === 'development') {
  // Highlight's dev instance expects HTTPS. Disable HTTPS errors in development.
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export const withHighlight = Highlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	backendUrl: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL,
})
 ```

2. Wrap your `/pages/api` functions with `withHighlight`:

```typescript
// pages/api/test.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withHighlight } from '@/app/utils/highlight.config'
import { z } from 'zod'

export default withHighlight(function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const success = z.enum(['true', 'false']).parse(req.query.success)

	console.info('Here: /api/app-directory-test', { success })

	if (success === 'true') {
		res.send('Success: /api/app-directory-test')
	} else {
		throw new Error('Error: /api/app-directory-test')
	}
})
```

## Instrument the server

Next.js comes out of the box instrumented for Open Telemetry. Our example Highlight implementation will use Next's [experimental instrumentation feature](https://nextjs.org/docs/advanced-features/instrumentation) to configure Open Telemetry on our Next.js server. There are probably other ways to configure Open Telemetry with Next... but this is our favorite.


1. Install `next-build-id` with `npm install next-build-id`.
2.  Turn on `instrumentationHook`. We've also turned on `productionBrowserSourceMaps` because Highlight is much easier to use with source maps.

```javascript
// next.config.js
const nextBuildId = require('next-build-id')

/** @type {import('next').NextConfig} */
const nextConfig = {
	generateBuildId: () => nextBuildId({ dir: __dirname }),
	experimental: {
		appDir: true,
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: true,
}

module.exports = nextConfig
```

3. Create `instrumentation.ts` at the root of your project as explained in the [instrumentation guide](https://nextjs.org/docs/advanced-features/instrumentation). Call `registerHighlight` from within the exported `register` function:

```javascript
// instrumentation.ts
import CONSTANTS from '@/app/constants'
import { registerHighlight } from '@highlight-run/next'

export async function register() {
	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	})
}
```

## Instrument the client

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
					recordHeadersAndBody: true,
					urlBlocklist: [],
				}}
				backendUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL}
			/>

			<Component {...pageProps} />
		</>
	)
}
```

2. For App Directory, add `HighlightInit` to your `layout.tsx` file.

```javascript
// src/app/layout.tsx
import './globals.css'

import CONSTANTS from '@/app/constants'
import { HighlightInit } from '@highlight-run/next/highlight-init'

export const metadata = {
	title: 'Highlight Next Demo',
	description: 'Check out how Highlight works with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HighlightInit
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: [],
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

## Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

You likely want to associate your back-end errors to client sessions.

## Test source maps

We recommend shipping your source maps to your production server. Your client-side JavaScript is always public, and code decompilation tools are so powerful that obscuring your source code may not be helpful.

Shipping source maps to production with Next.js is as easy as setting `productionBrowserSourceMaps: true` in your `nextConfig`.

Alternatively, you can upload source maps directly to Highlight using our `withHighlightConfig` function.

Make sure to implement `nextConfig.generateBuildId` so that our source map uploader can version your source maps correctly. Make sure to omit `productionBrowserSourceMaps` or set it to false to enable the source map uploader.

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
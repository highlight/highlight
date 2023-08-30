This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Highlight Installation

## Limitations 

- ⚠️ We are working on App Directory support. App Directory has not reached feature-parity with standard Next, so we're waiting for a stable release to lock down our integration. We're capturing App Directory API errors, but we've been unable to capture server-side errors from App Directory routes.
- ⚠️ Sourcemaps do not work in development mode. Run `yarn build && yarn start` to test compiled sourcemaps in Highlight.

## Environment Configuration (Very optional)

The e2e app is already configured to work out of the box for local development (for project_id=1) but if you need to, you can override the configuration by adjusting the values in `e2e/nestjs/.env`.

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
import { Highlight } from '@highlight-run/next/server'

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

Next.js comes out of the box instrumented for Open Telemetry. This example Highlight implementation will use Next's [experimental instrumentation feature](https://nextjs.org/docs/advanced-features/instrumentation) to configue Open Telemetry on our Next.js server. There are probably other ways to configure Open Telemetry with Next... but this is our favorite.


1. Install `next-build-id` with `npm install next-build-id`.
2.  Turn on `instrumentationHook`. We've also turned on `productionBrowserSourceMaps` because Highlight is much easier to use with sourcemaps. Notice that we're transpiling the `@highlight-run/next/client` package.

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
import { registerHighlight } from '@highlight-run/next/server'

export async function register() {
	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	})
}
```

## Instrument the client

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
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				serviceName="my-nextjs-frontend"
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

2. For App Directory, add `HighlightInit` to your `layout.tsx` file.

```javascript
// src/app/layout.tsx
import './globals.css'

import CONSTANTS from '@/app/constants'
import { HighlightInit } from '@highlight-run/next/client'

export const metadata = {
	title: 'Highlight Next Demo',
	description: 'Check out how Highlight works with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HighlightInit
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				serviceName="my-nextjs-frontend"
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

## Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

You likely want to associate your back-end errors to client sessions.

## Test sourcemaps

We recommend shipping your sourcemaps to your production server. Your client-side JavaScript is always public, and code decompilation tools are so powerful that obscuring your source code may not be helpful.

Shipping sourcemaps to production with Next.js is as easy as setting `productionBrowserSourceMaps: true` in your `nextConfig`.

Alternatively, you can upload sourcemaps directly to Highlight using our `withHighlightConfig` function. See [Next.js Overview](https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js.md) for more details.

Make sure to implement `nextConfig.generateBuildId` so that our sourcemap uploader can version your sourcemaps correctly. Make sure to omit `productionBrowserSourceMaps` or set it to false to enable the sourcemap uploader.

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
	productionBrowserSourceMaps: false,
}

module.exports = withHighlightConfig(nextConfig)
```

You must export your `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` to your build process. If you're building and deploying with Vercel, try our [Highlight Vercel Integration](https://vercel.com/integrations/highlight) to inject `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` automatically.

[Sourcemap upload api key](https://user-images.githubusercontent.com/878947/235971066-def65bcb-1580-4e8a-9d69-3e5556d51b27.webm)

## Vercel Log Drain




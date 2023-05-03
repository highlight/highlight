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

- ⚠️ We are working on App Directory support. App Directory has not reached feature-parity with standard Next, so we're waiting for a stable release to lock down our integration.
- ⚠️ Sourcemaps do not work in development mode. Run `yarn build && yarn start` to test compiled sourcemaps in Highlight.

## Environment Configuration (Very optional)

> This section is extra opinionated about Next.js constants. It's not for everyone. We like how `zod` and TypeScript work together to validate `process.env` inputs... but this is a suggestion. Do your own thing!

1. Edit `.env` to add your projectID to `NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID`
2. To send data to a locally-running instance of Highlight, create `.env.local` at your project root with variables for your local `otlpEndpoint` and `backendUrl`:

```bash
# .env.local

NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID='1jdkoe52'
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

const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
		NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT: stringOrUndefined,
		NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL: stringOrUndefined,
	})
	.parse(process.env)

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

Next.js comes out of the box instrumented for Open Telemetry. This example Highlight implementation will use Next's [experimental instrumentation feature](https://nextjs.org/docs/advanced-features/instrumentation) to configue Open Telemetry on our Next.js server. There are probably other ways to configure Open Telemetry with Next... but this is our favorite.


1.  Turn on `instrumentationHook`. We've also turned on `productionBrowserSourceMaps` because Highlight is much easier to use with sourcemaps.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
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
import { registerHighlight } from '@highlight-run/next'

export async function register() {
	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	})
}
```

## Instrument the client



## Turn on `tracingOrigins` and `networkRecording`

[Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this)

Make sure that back-end errors are associated with front-end sessions

## Test sourcemaps

## Vercel Log Drain




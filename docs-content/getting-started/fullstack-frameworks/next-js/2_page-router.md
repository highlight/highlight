---
title: Next.js Page Router Guide
slug: environment
heading: Next.js Page Router Guide
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/QJkjrIvJ-YI"
  title="Page Route for Next.js"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Installation

```shell
npm install @highlight-run/next
```

## Client instrumentation

This sections adds session replay and frontend error monitoring to Highlight. This implementation requires React 17 or greater. If you're behind on React versions, follow our [React.js docs](../../3_client-sdk/1_reactjs.md)

- Check out this example [environment variables](./7_advanced-config.md#environment-variables) set up for the `CONSTANTS` import.
- Add `<HighlightInit>` to `_app.tsx`.

```jsx
// pages/_app.tsx
import { AppProps } from 'next/app'
import { CONSTANTS } from '../constants'
import { HighlightInit } from '@highlight-run/next/client'

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<HighlightInit
				// excludedHostnames={['localhost']}
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				serviceName="my-nextjs-frontend"
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
				debug
			/>

			<Component {...pageProps} />
		</>
	)
}
```

## Add React ErrorBoundary (optional)

Optionally add a React [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

You can wrap the root of your app in `_app.tsx` with the `<ErrorBoundary />`, or you can wrap individual parts of your React tree.


```jsx
// components/error-boundary.tsx
'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<HighlightErrorBoundary showDialog>
			{children}
		</HighlightErrorBoundary>
	)
}
```

## Validate client instrumentation

Render this example component somewhere in your client application to see it in action.

```hint
Omit the `ErrorBoundary` wrapper if you haven't created it yet.
```


```jsx
// pages/page-router-test.tsx
// http://localhost:3000/page-router-test
'use client'

import { useEffect, useState } from 'react'

import { ErrorBoundary } from '../components/error-boundary'

export default function ErrorButtons() {
	const [isErrored, setIsErrored] = useState(false)

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '20rem',
				gridGap: '1rem',
				padding: '2rem',
			}}
		>
			<ErrorBoundary>
				<button
					onClick={() => {
						throw new Error('Threw client-side Error')
					}}
				>
					Throw client-side onClick error
				</button>

				<ThrowerOfErrors isErrored={isErrored} setIsErrored={setIsErrored} />
				<button onClick={() => setIsErrored(true)}>Trigger error boundary</button>
				<button
					onClick={async () => {
						throw new Error('an async error occurred')
					}}
				>
					Trigger promise error
				</button>
			</ErrorBoundary>
		</div>
	)
}

function ThrowerOfErrors({
	isErrored,
	setIsErrored,
}: {
	isErrored: boolean
	setIsErrored: (isErrored: boolean) => void
}) {
	useEffect(() => {
		if (isErrored) {
			setIsErrored(false)
			throw new Error('Threw useEffect error')
		}
	}, [isErrored, setIsErrored])

	return null
}
```

## Enable server-side tracing

We use `experimental.instrumentationHook` to capture [Next.js's automatic instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry). This method captures detailed API route tracing as well as server-side errors.

1. Enable `experimental.instrumentationHook` in `next.config.js`.
2. Setup the `withHighlightConfig` wrapper for auto-upload of your [sourcemaps](../../../general/6_product-features/2_error-monitoring/sourcemaps.md).

```javascript
// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

const nextConfig = {
	experimental: {
		instrumentationHook: true,
	},
	// ...additional config
}

export default withHighlightConfig(nextConfig)
```

```hint
 If you are using a Docker image to deploy your Next.js app, make sure that the `next.config.js` file is copied into the final Docker image.
 Otherwise, the next server will not enable the `instrumentationHook` in your production deploy.
```

2. Call `registerHighlight` in `instrumentation.ts` or `src/instrumentation.ts` if you're using a `/src` folder. Make sure that `instrumentation.ts` is a sibling of your `pages` folder. 
```jsx
// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from './constants'

export async function register() {
	const { registerHighlight } = await import('@highlight-run/next/server')

	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		serviceName: 'my-nextjs-backend',
	})
}
```

## Catch server-side render (SSR) errors

Page Router uses [pages/_error.tsx](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#more-advanced-error-page-customizing) to send server-side render errors to the client. We can catch and consume those errors with a custom error page.

These SSR error will display as client errors on your Highlight dashboard.

```jsx
// pages/_error.tsx
import { PageRouterErrorProps, pageRouterCustomErrorHandler } from '@highlight-run/next/ssr'

import { CONSTANTS } from '../constants'
import NextError from 'next/error'

export default pageRouterCustomErrorHandler(
	{
		projectId: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		// ...otherHighlightOptions
	},
	/**
	 *
	 * This second argument is purely optional.
	 * If you don't pass it, we'll use the default Next.js error page.
	 *
	 * Go ahead and pass in your own error page.
	 */
	(props: PageRouterErrorProps) => <NextError {...props} />,
)
```

```hint
`pageRouterCustomErrorHandler` is incompatible with `getInitialProps`. 

You'll see `Error: You can not use getInitialProps with getServerSideProps. Please remove getInitialProps.` 

Remove `pageRouterCustomErrorHandler` and consume the error in your `getServerSideProps` function by injecting the following code into your handler:
```

```javascript
// client-side example; 
// Errors can be sent server-side with `import { H } from '@highlight-run/next/server'`
import { H } from '@highlight-run/next/ssr'

const projectId = '<project id>'
const highlightOptions = {
	// Highlight options: https://www.highlight.io/docs/sdk/client#Hinit
}

H.init(projectId, highlightOptions)
H.consumeError(new Error("Your custom error message"))
```

### [Advanced] Propagate distributed tracing context with W3CTraceContextPropagation

If you have another API service that you're making a request to, you'll want to propagate
the trace context to that microservice so that logs and spans emitted by it will be attributed to the same trace.
To do that, propagate the context in the headers via the `@opentelemetry/api` package.

```tsx
// pages/api/page-router-trace.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '@/app/_utils/page-router-highlight.config'
import { H } from '@highlight-run/next/server'
import { context, propagation } from '@opentelemetry/api'

export default withPageRouterHighlight(async function handler(
        req: NextApiRequest,
        res: NextApiResponse,
) {
  const { span } = H.startWithHeaders('page-router-span', {})
  
  const headers = {}
  propagation.inject(context.active(), headers)
  await fetch('http://my-other-service/api', {
    method: 'POST',
    headers,
  })
  
  span.end()

  res.send(`Trace sent! Check out this random number: ${Math.random()}`)
})

```

### Validate SSR error capture

1. Copy the following code into `pages/page-router-ssr.tsx`.
2. Build and start your production app with `npm run build && npm run start`.
3. Visit http://localhost:3000/page-router-ssr?error to trigger the error.
4. Once you've validated that the error is caught and sent to `app.highlight.io`, don't forget to `ctrl + c` to kill `npm run start` and restart with `npm run dev`.

```jsx
// pages/page-router-ssr.tsx
import { useRouter } from 'next/router'

type Props = {
	date: string
	random: number
}
export default function SsrPage({ date, random }: Props) {
	const router = useRouter()
	const isError = router.asPath.includes('error')

	if (isError) {
		throw new Error('SSR Error: pages/page-router-ssr.tsx')
	}

	return (
		<div>
			<h1>SSR Lives</h1>
			<p>The random number is {random}</p>
			<p>The date is {date}</p>
		</div>
	)
}

export async function getStaticProps() {
	return {
		props: {
			random: Math.random(),
			date: new Date().toISOString(),
		},
		revalidate: 10, // seconds
	}
}
```

## API route instrumentation


<EmbeddedVideo 
  src="https://www.youtube.com/embed/4xDCu5jSBxo"
  title="Next.js API Endpoints"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

```hint
This section applies to Next.js Page Router routes only. Each Page Router route must be wrapped individually.
```

######

1. Create a file to export your `PageRouterHighlight` wrapper function:

 ```javascript
// utils/page-router-highlight.config.ts:
import { CONSTANTS } from '../constants'
import { PageRouterHighlight } from '@highlight-run/next/server'

export const withPageRouterHighlight = PageRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
 ```

2. Wrap your `/pages/api` functions with `withPageRouterHighlight`:

```typescript
// pages/api/nodejs-page-router-test.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '../../utils/page-router-highlight.config'

export default withPageRouterHighlight(function handler(req: NextApiRequest, res: NextApiResponse) {
	console.info('Here: pages/api/nodejs-page-router-test.ts')

	if (req.url?.includes('error')) {
		throw new Error('Error: pages/api/nodejs-page-router-test.ts')
	} else {
		res.send('Success: pages/api/nodejs-page-router-test.ts')
	}
})
```

3. Add `highlightMiddleware` to enable cookie-based session tracking

```typescript
// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { highlightMiddleware } from '@highlight-run/next/server'

export function middleware(request: NextRequest) {
	highlightMiddleware(request)

	return NextResponse.next()
}
```

## Validation

1. Run your app in dev mode with `npm run dev`.
2. Copy/paste the above code snippet into `/pages/api/nodejs-page-router-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

```bash
curl http://localhost:3000/api/nodejs-page-router-test?error
```

### Skip localhost tracking

```hint
We do not recommend enabling this while integrating Highlight for the first time because it will prevent you from validating that your local build can send data to Highlight.
```

In the case that you don't want local sessions sent to Highlight, the `excludedHostnames` prop accepts an array of partial or full hostnames. For example, if you pass in `excludedHostnames={['localhost', 'staging']}`, you'll block `localhost` on all ports, `www.staging.highlight.io` and `staging.highlight.com`.

Alternatively, you could manually call `H.start()` and `H.stop()` to manage invocation on your own.

```jsx
// components/custom-highlight-start.tsx
'use client'

import { H } from '@highlight-run/next/client'
import { useEffect } from 'react'

export function CustomHighlightStart() {
	useEffect(() => {
		const shouldStartHighlight = window.location.hostname === 'https://www.highlight.io'

		if (shouldStartHighlight) {
			H.start()

			return () => {
				H.stop()
			}
		}
	})

	return null
}
```

```jsx
// pages/_app.tsx
<HighlightInit
	manualStart
	projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
	serviceName="my-nextjs-frontend"
/>
<CustomHighlightStart />
```

## Related steps

- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [App router instrumentation](./3_app-router.md)
- [Advanced Configuration](./7_advanced-config.md)

---
title: Page Router
slug: environment
heading: Next.js Page Router
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---


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

2. Call `registerHighlight` in `instrumentation.ts`
```jsx
// instrumentation.ts
import { CONSTANTS } from './constants'

export async function register() {
	const { registerHighlight } = await import('@highlight-run/next/server')

	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		serviceName: 'my-nextjs-backend',
	})
}
```

3. App Router instrumentation requires `app/instrumentation.ts` to be defined, so re-export your handler from `./instrumentation.ts`
```typescript
// src/instrumentation.ts:
export { register } from '../instrumentation'

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

### Skip localhost tracking

```hint
We do not recommend enabling this while integrating Highlight for the first time because it will prevent you from validating that your local build can send data to Highlight.
```

In the case that you don't want local sessions sent to Highlight, the `excludedHostnames` prop accepts an array of partial or full hostnames. For example, if you pass in `excludedHostnames={['localhost', 'staging]}`, you'll block `localhost` on all ports, `www.staging.highlight.io` and `staging.highlight.com`.

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

- [Page Router API instrumentation](./4_api-page-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
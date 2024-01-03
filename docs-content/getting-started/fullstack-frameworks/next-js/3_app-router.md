---
title: Next.js App Router Guide
slug: environment
heading: Next.js App Router Guide
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---


## Installation

```shell
npm install @highlight-run/next
```

## Client instrumentation

This sections adds session replay and frontend error monitoring to Highlight. This implementation requires React 17 or greater.

- Check out this example [environment variables](./7_advanced-config.md#environment-variables) set up for the `CONSTANTS` import.
- Add `HighlightInit` to your `layout.tsx` file.

```jsx
// app/layout.tsx
import { CONSTANTS } from '../constants'
import { HighlightInit } from '@highlight-run/next/client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

			<html lang="en">
				<body>{children}</body>
			</html>
		</>
	)
}
```

## Add React ErrorBoundary (optional)

Optionally add a React [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

You can wrap the root of your app in `layout.tsx` with the `<ErrorBoundary />`, or you can wrap individual parts of your React tree.

```jsx
// components/error-boundary.tsx
'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	return <HighlightErrorBoundary showDialog>{children}</HighlightErrorBoundary>
}
```

## Validate client implementation

- Render this example component somewhere in your client application to see it in action.

```hint
Omit the `ErrorBoundary` wrapper if you haven't created it yet.
```

```jsx
// app/app-router-test/page.tsx
// http://localhost:3000/app-router-test
'use client'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from '../../components/error-boundary'

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

App Router uses [app/error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) to send server-side render errors to the client. We can catch and consume those errors with a custom error page.

All SSR error will display as client errors on your Highlight dashboard.

We don't call `H.init` in this example because we injected `<HighlightInit />` into the layout using `app/layout.tsx`.

```jsx
// app/error.tsx
'use client' // Error components must be Client Components

import {
	appRouterSsrErrorHandler,
	AppRouterErrorProps,
} from '@highlight-run/next/ssr'

export default appRouterSsrErrorHandler(
	({ error, reset }: AppRouterErrorProps) => {
		console.error(error)

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
	},
)
```

### Validate SSR error capture

1. Copy the following code into `app/app-router-ssr/page.tsx`.
2. Build and start your production app with `npm run build && npm run start`.
3. Visit http://localhost:3000/app-router-ssr?error to trigger the error.
4. Once you've validated that the error is caught and sent to `app.highlight.io`, don't forget to `ctrl + c` to kill `npm run start` and restart with `npm run dev`.

```jsx
// app/app-router-ssr/page.tsx
type Props = {
	searchParams: { error?: string }
}

export default function SsrPage({ searchParams }: Props) {
	if (typeof searchParams.error === 'string') {
		throw new Error('SSR Error: app/app-router-ssr/page.tsx')
	}

	return (
		<div>
			<h1>App Directory SSR: Success</h1>
			<p>The random number is {Math.random()}</p>
			<p>The date is {new Date().toLocaleTimeString()}</p>
		</div>
	)
}

export const revalidate = 30 // seconds
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
// app/layout.tsx
<HighlightInit
	manualStart
	projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
	serviceName="my-nextjs-frontend"
/>
<CustomHighlightStart />
```

## API route instrumentation

Node.js 

```hint
 Each App Router route must be wrapped individually.
```

######

1. Add `@highlight-run/node` to `experimental.serverComponentsExternalPackages` in your `next.config.js`. 

```javascript
// next.config.js
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@highlight-run/node'],
	},
}

module.exports = nextConfig
```

2. Create a file to export your `AppRouterHighlight` wrapper function:

```typescript
// utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from '@highlight-run/next/server'
import { CONSTANTS } from '../constants'

export const withAppRouterHighlight = AppRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
```

3. Wrap your `/app` functions with `withAppRouterHighlight`: 

```typescript
// app/nodejs-app-router-test/route.ts
import { NextRequest } from 'next/server'
import { withAppRouterHighlight } from '../../utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
	console.info('Here: app/nodejs-app-router-test/route.ts')

	if (request.url?.includes('error')) {
		throw new Error('Error: app/nodejs-app-router-test (App Router)')
	} else {
		return new Response('Success: app/nodejs-app-router-test')
	}
})
```

## Validation

1. Run your app in dev mode with `npm run dev`.
2. Copy/paste the above code snippet into `/app/api/nodejs-app-router-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

```bash
curl http://localhost:3000/nodejs-app-router-test?error
```

## Related steps

- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Page router instrumentation](./2_page-router.md)
- [Advanced Configuration](./7_advanced-config.md)
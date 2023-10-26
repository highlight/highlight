---
title: Next.js App Router
slug: environment
heading: Next.js App Router
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---


## Installation

```shell
# with npm
npm install @highlight-run/next
```

## Client Instrumentation

This sections adds session replay and frontend error monitoring to Highlight. This implementation requires React 17 or greater. If you're behind on React versions, follow our [React.js docs](../../3_client-sdk/1_reactjs.md)

- Add `HighlightInit` to your `layout.tsx` file.

```jsx
// src/app/layout.tsx
import './globals.css'

import CONSTANTS from '../constants'
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

- Optionally add a React [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

```jsx
// error-boundary.tsx
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

## Validate client implementation

- Render this example component somewhere in your client application to see it in action.

```hint
Omit the `ErrorBoundary` wrapper if you haven't created it yet.
```

```jsx
'use client'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from 'error-boundary'

export function ErrorButtons() {
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

				<ThrowerOfErrors
					isErrored={isErrored}
					setIsErrored={setIsErrored}
				/>
				<button onClick={() => setIsErrored(true)}>
					Trigger error boundary
				</button>
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

## Catch server-side render (SSR) errors (optional)

App Router uses [app/error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) to send server-side render errors to the client. We can catch and consume those errors with a custom error page.

These errors will display as client errors, even though we know that they're server errors.

We don't call `H.init` in this example because we injected `<HighlightInit />` into the layout using `src/app/layout.tsx`.

```jsx
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

### Validate SSR error capture

Copy the following code into `src/app/app-router-isr/page.tsx` and visit `http://localhost:3000/app-router-isr?error=true` to trigger the error.

```jsx
// src/app/app-router-isr/page.tsx
type Props = {
	searchParams: { error?: string }
}

export default function IsrPage({ searchParams }: Props) {
	if (searchParams.error) {
		throw new Error('ISR Error: src/app/app-router-isr/page.tsx')
	}

	return (
		<div>
			<h1>App Directory ISR: Success</h1>
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
<HighlightInit
	manualStart
	projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
	serviceName="my-nextjs-frontend"
/>
<CustomHighlightStart />
```

```jsx
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

## Related Steps

- [App Router API instrumentation](./5_api-app-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
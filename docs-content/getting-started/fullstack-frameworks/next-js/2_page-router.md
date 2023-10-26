---
title: Next.js Page Router
slug: environment
heading: Next.js Page Router
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

Add `<HighlightInit>` to `_app.tsx`.

```jsx
// pages/_app.tsx
import { AppProps } from 'next/app'
import CONSTANTS from '../app/constants'
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

## Validate client instrumentation

Render this example component somewhere in your client application to see it in action.

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

Page Router uses [pages/_error.tsx](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#more-advanced-error-page-customizing) to send server-side render errors to the client. We can catch and consume those errors with a custom error page.

These errors will display as client errors, even though we know that they're server errors.

```jsx
// pages/_error.tsx
import CONSTANTS from '../app/constants'
import NextError from 'next/error'
import {
	H,
	getHighlightErrorInitialProps,
	HighlightErrorProps,
} from '@highlight-run/next/client'

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

### Validate SSR error capture

Copy the following code into `pages/page-router-isr.tsx` and visit `http://localhost:3000/page-router-isr?error=true` to trigger the error.

```jsx
// pages/page-router-isr.tsx
import { useRouter } from 'next/router'

type Props = {
	date: string
	random: number
}
export default function IsrPage({ date, random }: Props) {
	const router = useRouter()
	const isError = router.asPath.includes('error')

	if (isError) {
		throw new Error('ISR Error: src/pages/page-router-isr.tsx')
	}

	return (
		<div>
			<h1>ISR Lives</h1>
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

- [Page Router API instrumentation](./4_api-page-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
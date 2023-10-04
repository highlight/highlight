---
title: SSR Error Handlers
slug: ssr-error-handlers
heading: SSR (Server-Side Render) Error Handlers
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
# with npm
npm install @highlight-run/next
```

## `pages/_error.tsx` (Page Router)

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

## `app/error.tsx` (App Router)

App Router uses [app/error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) to send server-side render errors to the client. We can catch and consume those errors with a custom error page.

These errors will display as client errors, even though we know that they're server errors.

We don't call `H.init` in this example because we injected `<HighlightInit />` into the layout using `src/app/layout.tsx`. See [Next.js Client Instrumentation](./3_client.md).

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

### Page Router Validation

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

### App Router Validation

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





## Next Steps

- [Configuration](./8_configuration.md)

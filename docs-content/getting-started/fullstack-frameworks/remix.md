---
title: Remix Walkthrough
slug: remix
heading: Remix Walkthrough
createdAt: 2023-07-20T00:00:00.000Z
updatedAt: 2023-07-20T00:00:00.000Z
---

## Overview

Our Remix SDK gives you access to frontend session replays and server-side monitoring,
all-in-one. 

1. Use `<HighlightInit />` to track session replay and client-side errors.
1. Use `H.init` to instrument Remix's `nodejs` server.

## Installation

```shell
# with yarn
yarn add @highlight-run/remix
```

## Client Instrumentation

- Inject `<HighlightInit />` into your app root.
- Optionally configure `excludedHostnames` to block a full or partial hostname. For example, `excludedHostnames={['staging']}` would not initialize Highlight on `staging.highlight.io`.
- Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

```javascript
// app/root.tsx
import { useLoaderData } from '@remix-run/react'

import { HighlightInit } from '@highlight-run/remix/client'
import { json } from '@remix-run/node'


export async function loader() {
	return json({
		ENV: {
			HIGHLIGHT_PROJECT_ID: process.env.HIGHLIGHT_PROJECT_ID,
		},
	})
}

export default function App() {
	const { ENV } = useLoaderData()

	return (
		<html lang="en">
			<HighlightInit
				excludedHostnames={['localhost']}
				projectId={ENV.HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{ enabled: true, recordHeadersAndBody: true }}
			/>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(ENV)}`,
					}}
				/>
			</head>

			{/* Render head, body, <Outlet />, etc. */}
		</html>
	)
}

```

- Optionally Create an `ErrorBoundary` component and export it from `app/root.tsx`

```javascript
// app/components/error-boundary.tsx
import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { ReportDialog } from '@highlight-run/remix/report-dialog'

export function ErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>
					{error.status} {error.statusText}
				</h1>
				<p>{error.data}</p>
			</div>
		)
	} else if (error instanceof Error) {
		return (
			<div>
				<script src="https://unpkg.com/highlight.run"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							H.init('\${process.env.HIGHLIGHT_PROJECT_ID}');
						`,
					}}
				/>
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>

				<ReportDialog />
			</div>
		)
	} else {
		return <h1>Unknown Error</h1>
	}
}
```

```javascript
// app/root.tsx
export { ErrorBoundary } from '~/components/error-boundary'
```
 
## Server Instrumentation

1. Use `H.init` from `@highlight-run/remix/server` to instrument the Remix server on Node.js.
1. Import `HandleError` from `@highlight-run/remix/server` and export `handleError` after setting `nodeOptions`.


```javascript
// app/entry.server.tsx
import { HandleError } from '@highlight-run/remix/server'

const nodeOptions = { projectID: process.env.HIGHLIGHT_PROJECT_ID }

export const handleError = HandleError(nodeOptions)

// Handle server requests

```

Alternatively, you can wrap Highlight's error handler and execute your own custom error handling code as well.

```javascript
// app/entry.server.tsx
import type { DataFunctionArgs } from '@remix-run/node'

import { H, HandleError } from '@highlight-run/remix/server'

const nodeOptions = { projectID: process.env.HIGHLIGHT_PROJECT_ID }

export function handleError(
	error: unknown,
	dataFunctionArgs: DataFunctionArgs,
) {
	const handleError = HandleError(nodeOptions)

	handleError(error, dataFunctionArgs)

	// custom error handling logic here
}

H.init(nodeOptions)

// Handle server requests
```

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
				serviceName="my-remix-frontend"
				tracingOrigins
				networkRecording={{ enabled: true, recordHeadersAndBody: true }}
			/>
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
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'

import { H, HandleError } from '@highlight-run/remix/server'

const nodeOptions = { projectID: process.env.HIGHLIGHT_PROJECT_ID }

export function handleError(
	error: unknown,
	dataFunctionArgs: LoaderFunctionArgs | ActionFunctionArgs,
) {
	const handleError = HandleError(nodeOptions)

	handleError(error, dataFunctionArgs)

	// custom error handling logic here
}

H.init(nodeOptions)

// Handle server requests
```

Handle streaming HTML responses using the `onError` handler of [`renderToPipeableStream`](https://remix.run/docs/en/1.19.3/guides/streaming#enable-react-18-streaming)


```javascript
function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				context={remixContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,
			{
				onShellReady() {
					shellRendered = true
					const body = new PassThrough()

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					if (shellRendered) {
						logError(error, request)
					}
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}

function logError(error: unknown, request?: Request) {
	const parsed = request
		? H.parseHeaders(Object.fromEntries(request.headers))
		: undefined

	if (error instanceof Error) {
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
	} else {
		H.consumeError(
			new Error(`Unknown error: ${JSON.stringify(error)}`),
			parsed?.secureSessionId,
			parsed?.requestId,
		)
	}

	console.error(error)
}
```

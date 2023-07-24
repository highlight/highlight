---
title: Remix Walkthrough
slug: remix
heading: Remix Walkthrough
createdAt: 2023-07-20T00:00:00.000Z
updatedAt: 2023-07-20T00:00:00.000Z
---

## Experimental Remix Support

We're experimenting with Remix and developing best practices to integrate Highlight into Remix.

Our `@highlight-run/remix` sdk is currently unstable. We're optimistic that we can validate and move to a `v1` in short order.

## Overview

Our Remix SDK gives you access to frontend session replays and server-side monitoring,
all-in-one. 

1. Use `<HighlightInit />` to track session replay and client-side errors.
1. Use `H.init` to instrument Remix's `nodejs` server.

## Installation

```shell
# with yarn
yarn add @highlight-run/remix @highlight-run/node highlight.run
```

## Client Instrumentation

- Inject `<HighlightInit />` into your app root.
- Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

```javascript
// ./app/root.tsx
import { useLoaderData } from '@remix-run/react'

import { HighlightInit } from '@highlight-run/remix/highlight-init'
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
				projectId={ENV.HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{ enabled: true, recordHeadersAndBody: true }}
			/>

			{/* Render head, body, <Outlet />, etc. */}
		</html>
	)
}

```
 
## Server Instrumentation

1. Use `H.init` from `@highlight-run/node` to instrument the Remix server on Node.js.
1. Import `HandleError` from `@highlight-run/remix/handle-error` and export `handleError` after setting `nodeOptions`.


```javascript
// .app/entry.server.tsx
import { H } from '@highlight-run/node'
import { HandleError } from '@highlight-run/remix/handle-error'

const nodeOptions = { projectID: CONSTANTS.HIGHLIGHT_PROJECT_ID }

export const handleError = HandleError(nodeOptions)

// Handle server requests

```

Alternatively, you can wrap Highlight's error handler and execute your own custom error handling code as well.

```javascript
// ./app/entry.server.tsx
import type { DataFunctionArgs } from '@remix-run/node'

import { H } from '@highlight-run/node'
import { HandleError } from '@highlight-run/remix/handle-error'

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

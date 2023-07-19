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
1. Use `H.init` from to instrument Remix's `nodejs` server.

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
			HIGHLIGHT_PROJECT_ID: process.env.HIGHLIGHT_PROJECT_ID || '1',
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

Use `H.init` from `@highlight-run/node` to instrument the Remix server on Node.js.

1. Create an `initHighlight` function:

```javascript
// ./app/utils/init-highlight.ts
import { CONSTANTS } from '~/constants'
import { H } from '@highlight-run/node'

export function initHighlight() {
	H.init({ projectID: CONSTANTS.HIGHLIGHT_PROJECT_ID })
}
```

2. Instrument your root request handler

```javascript
// ./entry.server.tsx
import { initHighlight } from '~/utils/init-highlight'

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
	loadContext: AppLoadContext,
) {
	initHighlight();

	console.log('Remix logging is live! 📦🚀')

	// Handle request
}
```

3. Instrument individual loaders.

```javascript
// app/routes/any-route.tsx
import { initHighlight } from '~/utils/init-highlight'

export async function loader({ request }: LoaderArgs) {
	initHighlight()

	// Handle loader
}
```
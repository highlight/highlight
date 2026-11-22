---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-11-14T00:00:00.000Z
updatedAt: 2026-11-14T00:00:00.000Z
---

## Overview

Our SvelteKit support gives you access to frontend session replays and server-side monitoring,
all-in-one.

1. Use the [SvelteKit browser quickstart](../3_browser/6_sveltekit.md) to track session replay and client-side errors.
1. Use `H.init` from `@highlight-run/node` to instrument your SvelteKit server in `hooks.server.ts`.

SvelteKit does not need a dedicated server SDK: the server runtime is Node.js
(or a Node-compatible adapter), so the [Node.js SDK](../../sdk/nodejs.md) covers
error monitoring, tracing and logging for `load` functions, form actions and
endpoints.

## Installation

```shell
# with npm
npm install @highlight-run/node

# with yarn
yarn add @highlight-run/node

# with pnpm
pnpm add @highlight-run/node
```

## Server Instrumentation

### 1. Initialize Highlight in `hooks.server.ts`

`hooks.server.ts` runs once when your SvelteKit server starts, which makes it
the right place to initialize the SDK. Guard the call with `H.isInitialized()`
so hot reloads and serverless cold starts do not initialize it twice.

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import { env } from '$env/dynamic/private'

if (!H.isInitialized()) {
	H.init({
		projectID: env.HIGHLIGHT_PROJECT_ID,
		serviceName: 'my-sveltekit-backend',
		serviceVersion: 'git-sha',
	})
}
```

### 2. Report server errors with `handleError`

SvelteKit calls the `handleError` hook for every unhandled error thrown in
`load` functions, form actions and endpoints. Forward those errors to
Highlight with `H.consumeError`, parsing the `secureSessionId` and `requestId`
from the request headers so the error is linked to the session replay that
produced it. See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = async ({ error, event }) => {
	const parsed = H.parseHeaders(Object.fromEntries(event.request.headers))

	if (error instanceof Error) {
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId, {
			url: event.url.pathname,
		})
	} else {
		H.consumeError(
			new Error(`Unknown error: ${JSON.stringify(error)}`),
			parsed?.secureSessionId,
			parsed?.requestId,
			{ url: event.url.pathname },
		)
	}

	console.error(error)

	return {
		message: 'Internal Error',
	}
}
```

Errors with an expected status code (thrown via SvelteKit's `error()` helper)
are also passed to `handleError`. If you only want to report unexpected
errors, skip `H.consumeError` when the error is an instance of SvelteKit's
`HttpError` with a status below 500.

### 3. Report errors manually

Errors that you catch yourself in a `load` function, form action or endpoint
never reach `handleError`. Report them with `H.consumeError` where you catch
them:

```typescript
// src/routes/blog/[slug]/+page.server.ts
import { H } from '@highlight-run/node'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, request }) => {
	try {
		const post = await getPost(params.slug)
		return { post }
	} catch (error) {
		const parsed = H.parseHeaders(Object.fromEntries(request.headers))

		if (error instanceof Error) {
			H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
		}

		throw error
	}
}
```

### 4. Record custom metrics

Use `H.recordMetric` to report point-in-time values from anywhere in your
server code, for example the duration of a slow query inside a `load`
function:

```typescript
import { H } from '@highlight-run/node'

const start = Date.now()
const rows = await db.query('SELECT ...')
H.recordMetric({ name: 'db.query_ms', value: Date.now() - start })
```

## Client Instrumentation

For session replay and client-side error monitoring, follow the
[SvelteKit browser quickstart](../3_browser/6_sveltekit.md). Initializing the
client with `tracingOrigins` set is what sends the session and request headers
that `H.parseHeaders` reads on the server, linking frontend sessions to
backend errors and traces.

## Verify

1. Start your app and trigger an error in a `load` function (for example,
   temporarily `throw new Error('SvelteKit test error')`).
1. Open your project in [app.highlight.io](https://app.highlight.io) and confirm
   the error appears under **Errors**, linked to the session that caused it.

---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-10-25T00:00:00.000Z
updatedAt: 2026-10-25T00:00:00.000Z
---

## Overview

Highlight gives you end-to-end fullstack visibility across your SvelteKit application, correlating client session replays directly with server errors, logs, and traces.

1. Use `highlight.run` in `src/hooks.client.ts` to capture session replays and frontend errors.
2. Use `@highlight-run/node` in `src/hooks.server.ts` to instrument server-side requests, logs, and unhandled errors.

## Installation

Install the Highlight client and Node.js SDKs with your package manager:

```shell
# with npm
npm install --save highlight.run @highlight-run/node

# with yarn
yarn add highlight.run @highlight-run/node

# with pnpm
pnpm add highlight.run @highlight-run/node
```

## Client Instrumentation

Initialize Highlight in your client hooks file (`src/hooks.client.ts` or `src/hooks.client.js`) and configure `tracingOrigins` so that outgoing `fetch` requests include the `x-highlight-request` distributed tracing header:

```typescript
// src/hooks.client.ts
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})
```

## Server Instrumentation

SvelteKit handles all incoming server requests through `hooks.server.ts`. We use two primary hooks:

1. **`handle`**: Initializes `@highlight-run/node` once and wraps `resolve(event)` with `H.runWithHeaders` to track server spans and propagate request context.
2. **`handleError`**: Extracts request identifiers via `H.parseHeaders` and forwards unhandled server exceptions to Highlight via `H.consumeError`.

```typescript
// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'
import { env } from '$env/dynamic/private'

// 1. Initialize the Highlight Node SDK once
if (!H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-app',
		environment: env.NODE_ENV ?? 'production',
	})
}

// 2. Wrap all server requests to record traces and link to frontend sessions
export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.route.id ?? event.url.pathname}`,
		event.request.headers,
		async (span) => {
			span.setAttribute('http.route', event.route.id ?? '')
			const response = await resolve(event)
			span.setAttribute('http.status_code', response.status)
			return response
		},
	)
}

// 3. Forward unexpected errors thrown in load functions or endpoints
export const handleError: HandleServerError = async ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		event.request.headers,
	)
	H.consumeError(
		error instanceof Error ? error : new Error(String(error)),
		secureSessionId,
		requestId,
		{ 'sveltekit.route': event.route.id ?? event.url.pathname },
	)
	await H.flush()

	return {
		message: 'Internal Server Error',
	}
}
```

## Logging & Custom Traces

With `@highlight-run/node` initialized, standard `console.log`, `console.info`, `console.warn`, and `console.error` calls are automatically captured and linked to the active request trace:

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	console.log('Loading dashboard data', { userId: locals.userId })
	return { status: 'ok' }
}
```

## Verification

To verify that server errors are recorded:

1. Create a test API route in `src/routes/api/test-error/+server.ts`:
   ```typescript
   export const GET = () => {
   	throw new Error('Test SvelteKit Server Error')
   }
   ```
2. Navigate to `/api/test-error` in your browser.
3. Check [Highlight Errors](https://app.highlight.io/errors) to verify the error appears with the corresponding request URL and stack trace.

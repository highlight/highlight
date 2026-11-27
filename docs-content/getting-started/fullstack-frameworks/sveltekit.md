---
title: SvelteKit Backend Instrumentation
slug: sveltekit
heading: SvelteKit Backend Instrumentation
createdAt: 2026-11-27T00:00:00.000Z
updatedAt: 2026-11-27T00:00:00.000Z
---

## Overview

This guide walks through instrumenting a **SvelteKit** Node.js backend with **Highlight** using `@highlight-run/node` for error monitoring, structured logging, and OpenTelemetry distributed tracing — and linking those backend events directly to frontend session replays.

1. Initialize `@highlight-run/node` once in `src/hooks.server.ts`.
2. Capture unhandled server exceptions in SvelteKit's `handleError` hook and correlate them with the active Highlight session.
3. Wrap incoming requests in SvelteKit's `handle` hook to automatically record request traces and logs.

## Installation

Install the Highlight Node SDK for server-side instrumentation (and `highlight.run` if you also want frontend session replay and fullstack trace linking):

```shell
# with npm
npm install @highlight-run/node highlight.run

# with pnpm
pnpm add @highlight-run/node highlight.run

# with yarn
yarn add @highlight-run/node highlight.run
```

Add your Highlight project ID to your `.env` file:

```env
HIGHLIGHT_PROJECT_ID="<YOUR_PROJECT_ID>"
PUBLIC_HIGHLIGHT_PROJECT_ID="<YOUR_PROJECT_ID>"
```

## Server Instrumentation (`src/hooks.server.ts`)

Create or update `src/hooks.server.ts` to initialize Highlight on server startup, trace every incoming request via `handle`, and report unhandled server errors via `handleError`.

```typescript
// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'
import { HIGHLIGHT_PROJECT_ID } from '$env/static/private'

H.init({
	projectID: HIGHLIGHT_PROJECT_ID,
	serviceName: 'my-sveltekit-backend',
	environment: process.env.NODE_ENV || 'development',
})

/**
 * Wraps every SvelteKit server request with Highlight trace context
 * so logs and child spans are automatically linked to the frontend session.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const { secureSessionId, requestId } = H.parseHeaders(headers)

	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		headers,
		async (span) => {
			span.setAttributes({
				'http.method': event.request.method,
				'http.route': event.route.id ?? event.url.pathname,
				'http.target': event.url.pathname,
			})

			const response = await resolve(event)
			span.setAttribute('http.status_code', response.status)

			if (response.status >= 500) {
				console.error('SvelteKit request returned 5xx', {
					path: event.url.pathname,
					status: response.status,
					secureSessionId,
					requestId,
				})
			}

			return response
		},
	)
}

/**
 * Captures unexpected server-side errors thrown in load functions,
 * form actions, or API routes (+server.ts) and forwards them to Highlight.
 */
export const handleError: HandleServerError = async ({
	error,
	event,
	status,
	message,
}) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const { secureSessionId, requestId } = H.parseHeaders(headers)

	const err =
		error instanceof Error ? error : new Error(String(error ?? message))

	H.consumeError(err, secureSessionId, requestId, {
		route: event.route.id ?? event.url.pathname,
		method: event.request.method,
		status: String(status),
	})

	// Flush pending telemetry in serverless / short-lived environments
	await H.flush()

	return {
		message: 'Internal Server Error',
	}
}
```

### Instrumenting API Endpoints (`+server.ts`)

Inside any SvelteKit endpoint (`src/routes/api/.../+server.ts`), standard `console.info`, `console.warn`, and `console.error` calls are automatically captured and correlated with the active request trace created in `handle`:

```typescript
// src/routes/api/health/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	console.info('Health check requested')
	return json({ ok: true, timestamp: new Date().toISOString() })
}
```

## Connecting Frontend Sessions to Backend Requests

To link backend errors, logs, and traces directly to the user's frontend session replay, initialize `highlight.run` on the client with `tracingOrigins` enabled. Highlight will automatically attach the `x-highlight-request` header to `fetch` requests sent to your SvelteKit server.

```typescript
// src/hooks.client.ts
import { H } from 'highlight.run'
import { PUBLIC_HIGHLIGHT_PROJECT_ID } from '$env/static/public'

if (typeof window !== 'undefined' && PUBLIC_HIGHLIGHT_PROJECT_ID) {
	H.init(PUBLIC_HIGHLIGHT_PROJECT_ID, {
		serviceName: 'my-sveltekit-frontend',
		tracingOrigins: true,
		networkRecording: {
			enabled: true,
			recordHeadersAndBody: true,
		},
	})
}
```

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for additional header propagation details.

## Verifying Your Setup

Add a temporary test route to confirm server errors and traces appear in your Highlight dashboard:

```typescript
// src/routes/api/highlight-test/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	console.info('Testing Highlight SvelteKit backend instrumentation')
	throw new Error('Test SvelteKit backend error for Highlight')
}
```

1. Start your SvelteKit dev server (`npm run dev`).
2. Visit `/api/highlight-test` in your browser.
3. Open your Highlight dashboard:
   - **Errors:** Confirm `Test SvelteKit backend error for Highlight` is logged with stack trace and route metadata.
   - **Traces & Logs:** Confirm the `GET /api/highlight-test` span and log entry are linked to your browser session.
4. Remove `/api/highlight-test` before deploying to production.

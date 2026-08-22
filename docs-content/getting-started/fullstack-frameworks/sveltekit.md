---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-06-15T00:00:00.000Z
updatedAt: 2026-06-15T00:00:00.000Z
---

## Overview

This guide adds Highlight to a SvelteKit app with frontend session replay, server-side request tracing, and backend error reporting.

1. Use `H.init` from `highlight.run` in `hooks.client.ts` for session replay and frontend errors.
1. Use `H.init`, `H.runWithHeaders`, and `H.consumeError` from `@highlight-run/node` in `hooks.server.ts` for backend instrumentation.

```hint
The backend setup below is for SvelteKit apps running on a Node-compatible adapter. If your SvelteKit app runs in an edge or worker runtime, use the runtime-specific OpenTelemetry setup instead of `@highlight-run/node`.
```

## Installation

Install the frontend and backend packages.

```shell
npm install highlight.run @highlight-run/node
```

## Client instrumentation

Initialize Highlight in `src/hooks.client.ts`. Setting `tracingOrigins` and `networkRecording` lets Highlight attach request headers that the backend SDK can use to connect server errors and traces back to the frontend session.

```typescript
// src/hooks.client.ts
import { PUBLIC_HIGHLIGHT_PROJECT_ID } from '$env/static/public'
import { H } from 'highlight.run'

H.init(PUBLIC_HIGHLIGHT_PROJECT_ID, {
	serviceName: 'my-sveltekit-frontend',
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})
```

```hint
Use `PUBLIC_HIGHLIGHT_PROJECT_ID` for browser code because SvelteKit only exposes environment variables prefixed with `PUBLIC_` to the client.
```

## Server instrumentation

Initialize the Node SDK once in `src/hooks.server.ts`, then wrap SvelteKit's `handle` hook with `H.runWithHeaders`. This creates a backend span for each request and links it to the Highlight frontend session when the client request includes Highlight headers.

```typescript
// src/hooks.server.ts
import { env } from '$env/dynamic/private'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError, RequestEvent } from '@sveltejs/kit'

const highlightProjectID = env.HIGHLIGHT_PROJECT_ID

if (highlightProjectID && !H.isInitialized()) {
	H.init({
		projectID: highlightProjectID,
		serviceName: 'my-sveltekit-backend',
		serviceVersion: env.COMMIT_SHA,
		environment: env.NODE_ENV,
	})
}

const getHeaders = (event: RequestEvent) =>
	Object.fromEntries(event.request.headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	if (!H.isInitialized()) {
		return resolve(event)
	}

	const routeName = event.route.id ?? event.url.pathname

	return H.runWithHeaders(
		`${event.request.method} ${routeName}`,
		getHeaders(event),
		async (span) => {
			span.setAttributes({
				'http.method': event.request.method,
				'http.route': routeName,
				'http.url': event.url.toString(),
			})

			const response = await resolve(event)
			span.setAttribute('http.status_code', response.status)

			return response
		},
	)
}
```

## Report server errors

SvelteKit sends unexpected server errors to the `handleError` hook. Report those errors with `H.consumeError`, using `H.parseHeaders` to attach the frontend session and request IDs when they are present.

```typescript
// src/hooks.server.ts
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	if (!H.isInitialized()) {
		return { message }
	}

	const routeName = event.route.id ?? event.url.pathname
	const { secureSessionId, requestId } = H.parseHeaders(getHeaders(event))
	const reportedError =
		error instanceof Error ? error : new Error(String(error ?? message))

	H.consumeError(reportedError, secureSessionId, requestId, {
		'http.method': event.request.method,
		'http.route': routeName,
		'http.status_code': status,
		'http.url': event.url.toString(),
	})

	await H.flush()

	return { message }
}
```

## Validate backend instrumentation

Add a temporary route that throws an error, then request it from a browser session where Highlight is initialized.

```typescript
// src/routes/highlight-test/+server.ts
export function GET() {
	throw new Error('Highlight SvelteKit server test')
}
```

1. Start the SvelteKit app with `HIGHLIGHT_PROJECT_ID` and `PUBLIC_HIGHLIGHT_PROJECT_ID` set to your Highlight project ID.
1. Open the app in a browser and navigate to `/highlight-test`.
1. Check the Highlight Errors page for `Highlight SvelteKit server test`.
1. Open the error details and confirm the linked session/request context is present.

Remove the temporary test route after validating the setup.

## Optional source maps

If you upload browser source maps in CI, use `@highlight-run/sourcemap-uploader` for the SvelteKit client build output. See the [source maps guide](../3_browser/7_replay-configuration/sourcemaps.md) for configuration details.

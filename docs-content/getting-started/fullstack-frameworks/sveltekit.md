---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2024-03-15T00:00:00.000Z
updatedAt: 2026-09-21T00:00:00.000Z
---

## Overview

There is no dedicated `@highlight-run/sveltekit` package. Use the browser SDK (`highlight.run`) plus `@highlight-run/node` on a Node adapter:

1. `hooks.client.ts` for session replay and client errors
2. `hooks.server.ts` for server errors, logs, and traces linked to that session

## Installation

```shell
npm install highlight.run @highlight-run/node
# or: yarn add highlight.run @highlight-run/node
# or: pnpm add highlight.run @highlight-run/node
```

Use `@sveltejs/adapter-node` (or another Node runtime). Edge adapters are out of scope for `@highlight-run/node`.

## Client instrumentation

Initialize in `hooks.client.ts` with `tracingOrigins` and `networkRecording` so the browser sends `x-highlight-request` on matching requests. Details: [Fullstack Mapping](/docs/getting-started/frontend-backend-mapping).

```ts
// src/hooks.client.ts
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
	environment: 'production',
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})
```

Also set `kit.paths.relative: false` in `svelte.config.js` so Highlight can fetch stylesheets for session replay (see the [browser SvelteKit quickstart](/docs/getting-started/browser/svelte-kit)).

## Server instrumentation

Initialize once outside prerender (`building`), wrap requests with `H.runWithHeaders`, and report unexpected errors from `handleError`.

Important SDK detail: copy headers into a plain object before `H.runWithHeaders` / `H.startWithHeaders`. `H.parseHeaders` already understands Web `Headers` via `.get()`, but OpenTelemetry `propagation.inject` mutates the carrier with `carrier[key] = value`, which does not update a `Headers` instance.

```ts
// src/hooks.server.ts
import { building } from '$app/environment'
import { env } from '$env/dynamic/private'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building) {
	H.init({
		projectID: env.HIGHLIGHT_PROJECT_ID ?? '<YOUR_PROJECT_ID>',
		serviceName: 'sveltekit-server',
		serviceVersion: 'git-sha',
		environment: 'production',
	})
}

function highlightCarrier(request: Request): Record<string, string> {
	return Object.fromEntries(request.headers)
}

export const handle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event)
	}

	const route = event.route.id ?? event.url.pathname
	return H.runWithHeaders(
		`${event.request.method} ${route}`,
		highlightCarrier(event.request),
		async (span) => {
			const response = await resolve(event)
			span.setAttribute('http.response.status_code', response.status)
			span.setAttribute('http.route', route)
			return response
		},
	)
}

export const handleError: HandleServerError = ({ error, event, message }) => {
	if (!building) {
		const { secureSessionId, requestId } = H.parseHeaders(
			highlightCarrier(event.request),
		)
		H.consumeError(
			error instanceof Error ? error : new Error(String(error)),
			secureSessionId,
			requestId,
		)
	}
	return { message }
}
```

### Why `handleError` matters

SvelteKit catches errors from `load` and `+server.ts` internally. Wrapping only `resolve()` in `try/catch` will not see those failures. Unexpected errors call `handleError`; expected `error(status, ...)` / `HttpError` responses do not.

### Manual reporting in routes

```ts
// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	try {
		throw new Error('example API failure')
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(
			Object.fromEntries(request.headers),
		)
		H.consumeError(error as Error, secureSessionId, requestId)
		return json({ ok: false }, { status: 500 })
	}
}
```

## Logs and traces

After `H.init`, console methods are recorded. Requests wrapped with `H.runWithHeaders` show up as traces. For a child span, call `H.startWithHeaders` inside the wrapper and `span.end()` when finished.

## Verify

1. Run the Node adapter build of your app
2. Hit a route that throws (for example `GET /api/highlight-test?error=1`)
3. Confirm the error, related logs, and request trace in [app.highlight.io](https://app.highlight.io) under the same project as the browser SDK

Interactive checklist: [SvelteKit server quickstart](/docs/getting-started/server/js/sveltekit).

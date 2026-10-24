---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-09-21T00:00:00.000Z
updatedAt: 2026-09-21T00:00:00.000Z
---

## Overview

Highlight instruments SvelteKit as a fullstack app:

1. Browser sessions and client errors via `highlight.run` in `hooks.client.ts`
2. Server errors, logs, and traces via `@highlight-run/node` in `hooks.server.ts`

Use the same project ID on both sides. Enable `tracingOrigins` and network recording on the client so Highlight can correlate frontend sessions with backend telemetry.

> **Runtime requirement:** `@highlight-run/node` needs a Node.js deployment (`@sveltejs/adapter-node` or equivalent). Edge adapters are not supported by the Node SDK.

## Installation

```bash
npm install highlight.run @highlight-run/node
```

## Client instrumentation

Initialize Highlight in `src/hooks.client.ts`:

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

Confirm CSS is served with absolute paths so session replay can fetch stylesheets:

```js
// svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		paths: {
			relative: false,
		},
	},
}

export default config
```

See the [browser SvelteKit quickstart](/docs/getting-started/client/js/svelte-kit) for identify and sourcemap steps.

## Server instrumentation

1. Skip SDK init during prerender (`building`)
2. Convert SvelteKit `Headers` to a plain object before `H.runWithHeaders` / `H.parseHeaders` (OpenTelemetry inject needs a mutable carrier; this matches the Remix docs pattern in this repo)
3. Wrap `handle` so every request becomes a traced span linked to the browser session
4. Report unexpected errors from `handleError` with `H.consumeError`

```ts
// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'sveltekit-server',
		serviceVersion: 'git-sha',
		environment: 'production',
	})
}

function highlightHeaders(request: Request): Record<string, string> {
	return Object.fromEntries(request.headers)
}

export const handle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event)
	}

	const route = event.route.id ?? event.url.pathname
	return H.runWithHeaders(
		`${event.request.method} ${route}`,
		highlightHeaders(event.request),
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
			highlightHeaders(event.request),
		)
		H.consumeError(
			error instanceof Error ? error : new Error(String(error)),
			secureSessionId,
			requestId,
			{
				'http.request.method': event.request.method,
				'http.route': event.route.id ?? event.url.pathname,
			},
		)
	}

	return { message }
}
```

## Manual reporting in routes

Uncaught errors in `+server.ts` and `+page.server.ts` reach `handleError`. If you catch errors yourself:

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

After `H.init`, `console` methods are captured automatically. Requests wrapped with `H.runWithHeaders` emit traces in Highlight. For important unit-of-work spans, call `H.startWithHeaders` inside a wrapped request and `span.end()` when finished.

## Verify

1. Start the Node adapter build of your app
2. Hit a route that throws (for example `GET /api/highlight-test?error=1`)
3. Confirm the error, related logs, and request trace appear in [app.highlight.io](https://app.highlight.io) under the same project / session as the browser SDK

For the interactive setup checklist, see the [SvelteKit server quickstart](/docs/getting-started/server/js/sveltekit).

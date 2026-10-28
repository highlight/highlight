---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Fullstack Instrumentation Walkthrough
createdAt: 2024-05-20T00:00:00.000Z
updatedAt: 2026-10-28T00:00:00.000Z
---

## Overview

Highlight integrates across both sides of a SvelteKit application:
1. **`highlight.run` in `src/hooks.client.ts`** captures session replay, frontend errors, and injects the `x-highlight-request` header on outgoing `fetch` calls.
2. **`@highlight-run/node` in `src/hooks.server.ts`** traces incoming server requests via `H.runWithHeaders`, captures structured `console` logs, and reports unhandled server exceptions in `handleError` via `H.consumeError`.

## Installation

```bash
npm install --save highlight.run @highlight-run/node
```

## Client Instrumentation (`src/hooks.client.ts`)

Enable `tracingOrigins` and `networkRecording` so browser requests attach the `x-highlight-request` correlation header:

```typescript
// src/hooks.client.ts
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
	environment: 'production',
	serviceName: 'my-sveltekit-frontend',
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})
```

## Server Instrumentation (`src/hooks.server.ts`)

In `src/hooks.server.ts`, initialize `@highlight-run/node` when `!building` (from `$app/environment`), convert `event.request.headers` to a plain header dictionary (`Object.fromEntries(event.request.headers)`), wrap requests in `H.runWithHeaders`, and report uncaught errors in `handleError`:

```typescript
// src/hooks.server.ts
import { building } from '$app/environment'
import { H, type NodeOptions } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightOptions: NodeOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
}

if (!building) {
	H.init(highlightOptions)
}

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers)

	return await H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		headers,
		async () => {
			return await resolve(event)
		},
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(`Unhandled SvelteKit server error: ${JSON.stringify(error)}`),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}
```

## Custom Spans in `+page.server.ts` & `+server.ts`

Use `H.startWithHeaders` inside server load functions, form actions, or API routes to trace database queries and external calls:

```typescript
// src/routes/orders/+page.server.ts
import { H } from '@highlight-run/node'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('load-orders-query', headers)

	try {
		console.info('Fetching orders for SvelteKit page load')
		return { orders: [] }
	} finally {
		span.end()
	}
}
```

## Runtime Notes

- `@highlight-run/node` relies on Node.js OpenTelemetry instrumentation (`@sveltejs/adapter-node` or default Vite Node dev/preview servers). For edge runtimes such as Cloudflare Workers, see the [Cloudflare Workers Quickstart](/docs/getting-started/server/js/cloudflare).

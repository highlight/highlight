---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Fullstack & Backend Instrumentation Walkthrough
createdAt: 2024-03-15T00:00:00.000Z
updatedAt: 2024-03-15T00:00:00.000Z
---

## Overview

Highlight provides fullstack observability for SvelteKit applications by combining browser session replay with Node.js backend error monitoring, structured logging, and distributed OpenTelemetry tracing:

1. Use `H.init()` from `highlight.run` in `src/hooks.client.ts` to capture frontend session replay, network requests, and browser errors.
2. Use `H.init()`, `H.runWithHeaders()`, and `H.consumeError()` from `@highlight-run/node` in `src/hooks.server.ts` to instrument SvelteKit's server hooks, `load` functions, form actions, and `+server.ts` API endpoints.

## Installation

Install both the browser SDK (`highlight.run`) and the Node.js backend SDK (`@highlight-run/node`):

```shell
# with npm
npm install highlight.run @highlight-run/node

# with pnpm
pnpm add highlight.run @highlight-run/node

# with yarn
yarn add highlight.run @highlight-run/node
```

## Client Instrumentation (`src/hooks.client.ts`)

Initialize `highlight.run` inside `src/hooks.client.ts` (or `src/hooks.client.js`). Enabling `tracingOrigins` and `networkRecording` ensures that SvelteKit `fetch` calls and form submissions inject the `x-highlight-request` header (`{secureSessionId}/{requestId}`), allowing Highlight to link frontend sessions to backend traces and errors.

See [Fullstack Mapping](../../2_frontend-backend-mapping.md) for details on how client-to-server correlation works.

```typescript
// src/hooks.client.ts
import { H } from 'highlight.run'
import type { HandleClientError } from '@sveltejs/kit'

H.init('<YOUR_PROJECT_ID>', {
	environment: 'production',
	version: 'commit:abcdefg12345',
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})

export const handleError: HandleClientError = ({ error, event }) => {
	if (error instanceof Error) {
		H.consumeError(error, {
			routeId: event.route.id ?? 'unknown',
			url: event.url.pathname,
		})
	}
}
```

### Confirm CSS is Served by Absolute Path

SvelteKit may generate relative CSS paths that can interfere with session replay stylesheet fetching. Update `svelte.config.js` to set `paths.relative: false`:

```javascript
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

## Backend Instrumentation (`src/hooks.server.ts`)

SvelteKit runs server-side request lifecycle hooks in `src/hooks.server.ts`. By initializing `@highlight-run/node` and exporting both [`handle`](https://kit.svelte.dev/docs/hooks#server-hooks-handle) and [`handleError`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror), you can automatically trace every incoming request and capture unhandled exceptions across server `load` functions, form actions, and API routes.

### 1. Initialize `@highlight-run/node` and Wrap Requests with `handle`

SvelteKit exposes request headers via the Web Fetch `Headers` API (`event.request.headers`). Convert the headers to a plain object with `Object.fromEntries(event.request.headers.entries())` and pass them to `H.runWithHeaders` so every downstream span and log inherits the caller's `secureSessionId` and `requestId`:

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	serviceVersion: 'git-sha',
	environment: 'production',
}

if (!H.isInitialized()) {
	H.init(highlightOptions)
}

const headersToRecord = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	const headers = headersToRecord(event.request.headers)

	return await H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		headers,
		async () => {
			return await resolve(event)
		},
	)
}
```

### 2. Report Unhandled Server Exceptions with `handleError`

SvelteKit invokes `handleError` in `src/hooks.server.ts` whenever an unexpected exception is thrown during server-side rendering, `load` execution, form actions, or `+server.ts` handlers. Parse the request headers with `H.parseHeaders` and report the error with `H.consumeError`:

```typescript
// src/hooks.server.ts
export const handleError: HandleServerError = ({
	error,
	event,
	status,
	message,
}) => {
	const parsed = H.parseHeaders(headersToRecord(event.request.headers))
	const normalizedError =
		error instanceof Error
			? error
			: new Error(`Unexpected SvelteKit error: ${JSON.stringify(error)}`)

	H.consumeError(normalizedError, parsed?.secureSessionId, parsed?.requestId, {
		status,
		routeId: event.route.id ?? 'unknown',
		url: event.url.pathname,
	})

	return {
		message,
	}
}
```

> **Composing Multiple Server Hooks:** If your SvelteKit app already uses `handle` for authentication or localization, use SvelteKit's [`sequence`](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence) helper from `@sveltejs/kit/hooks` and place the Highlight `handle` hook first so all subsequent hooks run inside the active Highlight trace context.

### 3. Tracing Server `load` Functions and Form Actions (`+page.server.ts`)

Inside `+page.server.ts` or `+layout.server.ts`, you can create custom spans with `H.startWithHeaders` to measure database queries, external API calls, or form action mutations, and manually report handled errors inside `try / catch` blocks:

```typescript
// src/routes/orders/+page.server.ts
import { H } from '@highlight-run/node'
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request, locals }) => {
	const headers = Object.fromEntries(request.headers.entries())
	const { span } = H.startWithHeaders('orders.page.load', headers, {
		attributes: { userId: locals.user?.id ?? 'anonymous' },
	})

	try {
		console.info('Fetching orders for user', { userId: locals.user?.id })
		return {
			orders: [{ id: 'ord_101', total: 49.99 }],
		}
	} finally {
		span.end()
	}
}

export const actions: Actions = {
	createOrder: async ({ request }) => {
		const headers = Object.fromEntries(request.headers.entries())
		const parsed = H.parseHeaders(headers)
		const { span } = H.startWithHeaders('orders.action.create', headers)

		try {
			const data = await request.formData()
			const item = data.get('item')
			if (!item) {
				throw new Error('Order item is required')
			}
			return { success: true }
		} catch (err) {
			if (err instanceof Error) {
				H.consumeError(err, parsed?.secureSessionId, parsed?.requestId)
			}
			return fail(400, { message: 'Failed to create order' })
		} finally {
			span.end()
		}
	},
}
```

### 4. Instrumenting `+server.ts` API Routes

In SvelteKit `+server.ts` endpoints, uncaught errors are automatically forwarded to `handleError` in `src/hooks.server.ts`. If you catch errors locally to return a custom HTTP status response, call `H.consumeError` with the parsed request headers:

```typescript
// src/routes/api/payments/+server.ts
import { H } from '@highlight-run/node'
import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers.entries())
	const parsed = H.parseHeaders(headers)

	try {
		// Payment processing logic
		return json({ status: 'processed' })
	} catch (err) {
		if (err instanceof Error) {
			H.consumeError(err, parsed?.secureSessionId, parsed?.requestId, {
				endpoint: '/api/payments',
			})
		}
		throw error(500, 'Payment processing failed')
	}
}
```

## Server Logging

Once `H.init()` is called in `src/hooks.server.ts`, built-in `console.log`, `console.info`, `console.warn`, and `console.error` statements executed on the SvelteKit server are automatically captured and correlated with the active request trace and frontend session. See the [Node.js Logging Guide](../backend-logging/js/overview.md) for advanced structured logging options with Pino or Winston.

## Verifying Your Setup

1. Start your SvelteKit development or production server (`npm run dev` or `npm run build && npm run preview`).
2. Navigate to a page in your browser to start a client session, then trigger a server-side error in a `+page.server.ts` load function or `+server.ts` endpoint.
3. Open [app.highlight.io/errors](https://app.highlight.io/errors) and [app.highlight.io/traces](https://app.highlight.io/traces) to confirm that the server error, logs, and spans appear and link directly to the corresponding browser session replay.

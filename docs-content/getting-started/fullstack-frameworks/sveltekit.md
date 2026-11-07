---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Fullstack Instrumentation
createdAt: 2024-05-20T00:00:00.000Z
updatedAt: 2024-05-20T00:00:00.000Z
---

## Overview

Highlight integrates with SvelteKit across both the browser (`hooks.client.ts`) and the Node.js server (`hooks.server.ts`) to provide session replay, error monitoring, logging, and distributed tracing:

1. Use `H.init` from `highlight.run` in `src/hooks.client.ts` to capture client-side session replays, network requests, and browser errors.
2. Use `H.init`, `H.runWithHeaders`, and `H.consumeError` from `@highlight-run/node` in `src/hooks.server.ts` to instrument SvelteKit server hooks (`handle` and `handleError`), `+page.server.ts` load functions, form actions, and `+server.ts` API endpoints.

## Installation

```shell
# with npm
npm install highlight.run @highlight-run/node

# with pnpm
pnpm add highlight.run @highlight-run/node

# with yarn
yarn add highlight.run @highlight-run/node
```

## Client Instrumentation (`src/hooks.client.ts`)

Initialize `highlight.run` in `src/hooks.client.ts` with `tracingOrigins: true` and `networkRecording` enabled so the `x-highlight-request` header (`secureSessionId` and `requestId`) is automatically attached to requests sent to your SvelteKit backend:

```typescript
// src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit'
import { H } from 'highlight.run'

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
		H.consumeError(error)
	}
}
```

Ensure `svelte.config.js` disables relative asset paths so Highlight can fetch stylesheets during session replay:

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

## Server Instrumentation (`src/hooks.server.ts`)

1. Initialize `@highlight-run/node` in `src/hooks.server.ts`.
2. Export a `handle` hook that converts `event.request.headers` with `Object.fromEntries(event.request.headers)` and wraps `resolve(event)` inside `H.runWithHeaders` to correlate server logs and spans with the originating frontend session.
3. Export a `handleError` hook that parses the incoming headers via `H.parseHeaders` and reports uncaught server exceptions via `H.consumeError`.

```typescript
// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers)

	return await H.runWithHeaders(headers, async () => {
		return await resolve(event)
	})
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

## Custom Spans & Manual Error Reporting in Server Routes

Inside `+page.server.ts` load functions, form actions, or `+server.ts` API routes, you can create custom spans with `H.startWithHeaders` or manually report handled errors with `H.consumeError`:

```typescript
// src/routes/api/checkout/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const POST: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const parsed = H.parseHeaders(headers)
	const { span } = H.startWithHeaders('checkout-request', headers)

	try {
		console.info('Processing SvelteKit checkout request')
		return json({ status: 'ok' })
	} catch (error) {
		if (error instanceof Error) {
			H.consumeError(error, parsed.secureSessionId, parsed.requestId)
		}
		throw error
	} finally {
		span.end()
	}
}
```

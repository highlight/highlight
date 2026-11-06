---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Fullstack & Backend Instrumentation Walkthrough
createdAt: 2024-03-15T00:00:00.000Z
updatedAt: 2024-03-15T00:00:00.000Z
---

## Overview

Highlight integrates with SvelteKit across both browser sessions (`hooks.client.ts`) and server-side Node.js hooks (`hooks.server.ts`), automatically linking frontend session replays with backend errors, logs, and OpenTelemetry traces.

1. Use `H.init` from `highlight.run` in `src/hooks.client.ts` to capture session replays and browser errors.
2. Use `H.init`, `H.runWithHeaders`, and `H.consumeError` from `@highlight-run/node` in `src/hooks.server.ts` to instrument SvelteKit server hooks, `+page.server.ts` load/actions, and `+server.ts` API endpoints.

## Installation

```shell
# with npm
npm install highlight.run @highlight-run/node

# with yarn
yarn add highlight.run @highlight-run/node

# with pnpm
pnpm add highlight.run @highlight-run/node
```

## Client Instrumentation (`src/hooks.client.ts`)

Initialize `highlight.run` inside `src/hooks.client.ts` with `tracingOrigins: true` and `networkRecording` enabled so the browser SDK attaches the `x-highlight-request` header to outgoing SvelteKit data requests:

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

Ensure `svelte.config.js` serves CSS via absolute paths so session replay can fetch stylesheets reliably:

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

### 1. Externalize `@highlight-run/node` in Vite SSR

Add `@highlight-run/node` to `ssr.external` in `vite.config.ts` so OpenTelemetry's native Node.js module hooks are not bundled during SSR builds:

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		external: ['@highlight-run/node'],
	},
})
```

### 2. Wire `handle` and `handleError` in `src/hooks.server.ts`

In `src/hooks.server.ts`:
- Call `H.init` once at module initialization.
- Wrap `resolve(event)` inside `H.runWithHeaders` in the `handle` hook so all downstream spans and console logs inherit the `x-highlight-request` context.
- Capture uncaught server exceptions in `handleError` using `H.parseHeaders` and `H.consumeError`.

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
			new Error(`Unhandled server error: ${JSON.stringify(error)}`),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}
```

### 3. Tracing `+page.server.ts` Loaders, Form Actions, and `+server.ts` Endpoints

You can create custom child spans or log structured events inside any server route:

```typescript
// src/routes/checkout/+page.server.ts
import type { Actions, PageServerLoad } from './$types'
import { H } from '@highlight-run/node'

export const load: PageServerLoad = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('checkout-page-load', headers)

	try {
		console.info('Loading checkout session')
		return { cartItems: [] }
	} finally {
		span.end()
	}
}

export const actions: Actions = {
	default: async ({ request }) => {
		const headers = Object.fromEntries(request.headers)
		const { span } = H.startWithHeaders('checkout-submit-action', headers)

		try {
			// Process order
			return { success: true }
		} catch (error) {
			const parsed = H.parseHeaders(headers)
			H.consumeError(error as Error, parsed.secureSessionId, parsed.requestId)
			throw error
		} finally {
			span.end()
		}
	},
}
```

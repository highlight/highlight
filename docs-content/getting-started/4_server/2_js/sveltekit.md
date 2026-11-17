---
toc: SvelteKit
title: SvelteKit Backend Instrumentation
heading: SvelteKit Backend Instrumentation
metaTitle: SvelteKit Backend Instrumentation
slug: sveltekit
createdAt: 2025-01-01T00:00:00.000Z
updatedAt: 2025-01-01T00:00:00.000Z
---

SvelteKit runs your server code (hooks, `+server.ts` endpoints, and `load` functions in `+page.server.ts` / `+layout.server.ts`) on Node.js. You can instrument it with the `@highlight-run/node` SDK to capture server-side errors, traces, and logs, and connect them to the frontend sessions recorded by the [SvelteKit client SDK](../../3_browser/6_sveltekit.md).

## Installation

```shell
# with npm
npm install @highlight-run/node
# with yarn
yarn add @highlight-run/node
# with pnpm
pnpm add @highlight-run/node
```

## Initialize the SDK

Initialize `H` once in `src/hooks.server.ts`. This file runs when the server starts, before any request is handled.

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import { env } from '$env/dynamic/private'

H.init({
	projectID: env.HIGHLIGHT_PROJECT_ID,
	serviceName: 'my-sveltekit-backend',
	environment: env.NODE_ENV,
})
```

`H.init` is safe to call more than once; only the first call creates the client.

## Trace requests

Wrap the `handle` hook with `H.runWithHeaders`. It reads the `x-highlight-request` header sent by the frontend SDK, creates a span for the request, and links it to the browser session. Errors thrown inside the callback are recorded on the span.

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		() => resolve(event),
	)
}
```

For the header to be sent, set `tracingOrigins` in the frontend SDK to include your backend's origin. See [Fullstack Mapping](../../2_frontend-backend-mapping.md) for details.

## Report errors

Export `handleError` from `src/hooks.server.ts` to report unexpected errors thrown by `load` functions, form actions, and endpoints. `H.parseHeaders` extracts the session and request IDs from the request so the error is linked to the session.

```typescript
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		event.request.headers,
	)

	if (error instanceof Error) {
		H.consumeError(error, secureSessionId, requestId, {
			path: event.url.pathname,
		})
	}

	return { message: 'Internal Error' }
}
```

You can also report handled errors anywhere on the server, such as in a `+server.ts` endpoint:

```typescript
// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	try {
		// ...
		return json({ ok: true })
	} catch (e) {
		const { secureSessionId, requestId } = H.parseHeaders(request.headers)
		H.consumeError(e as Error, secureSessionId, requestId)
		return json({ ok: false }, { status: 500 })
	}
}
```

## Logging

Once `H.init` has run, calls to `console.log`, `console.warn`, `console.error`, etc. on the server are sent to Highlight as logs. To send a log with extra attributes, use `H.log`:

```typescript
H.log('user signed in', 'info', secureSessionId, requestId, { userId: '123' })
```

## Flushing on serverless adapters

If you deploy with a serverless adapter (for example Vercel or Netlify), the process can be frozen as soon as the response is sent. Call `await H.flush()` before returning from your handler, or use `H.consumeAndFlush` in place of `H.consumeError`, so pending data is exported.

## Verify your setup

Add a route that throws:

```typescript
// src/routes/error/+page.server.ts
export const load = () => {
	throw new Error('Example SvelteKit server error')
}
```

Visit `/error` and open the [errors page](https://app.highlight.io/errors) in your Highlight project. The error should appear within a few moments, along with the related traces and logs.

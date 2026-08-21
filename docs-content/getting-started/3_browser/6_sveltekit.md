---
title: SvelteKit
heading: Using highlight.io with SvelteKit
slug: svelte-kit
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["svelte-kit"]}/>

## Backend instrumentation

SvelteKit runs server hooks in `hooks.server.ts`. Initialize the Highlight Node
SDK once in that file, then wrap each request with `H.runWithHeaders()` so
backend traces are linked to the same Highlight session and request as the
browser SDK.

```typescript
// hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

if (!H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-backend',
		serviceVersion: 'git-sha',
	})
}

const headersToObject = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(headersToObject(event.request.headers), async () => {
		return resolve(event)
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(headersToObject(event.request.headers))

	if (parsed && error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId, {
			url: event.url.pathname,
		})
	}
}
```

If you already have a `handle` hook, keep your existing logic inside the
`H.runWithHeaders()` callback. For example, authentication, locals setup, and
custom response headers should remain in the callback before or after
`resolve(event)`.

```typescript
export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(headersToObject(event.request.headers), async () => {
		event.locals.user = await getUser(event)

		const response = await resolve(event)
		response.headers.set('x-service-name', 'my-sveltekit-backend')

		return response
	})
}
```

## Validate backend instrumentation

Create a test route that throws on the server, then request it after starting
your SvelteKit app.

```typescript
// src/routes/highlight-server-test/+server.ts
export const GET = () => {
	throw new Error('Highlight SvelteKit backend test error')
}
```

Run your app and visit `/highlight-server-test`. The error should appear in
Highlight with `serviceName` set to `my-sveltekit-backend`. When the browser
SDK is also initialized with `tracingOrigins` and network recording enabled,
the backend error and trace will be associated with the originating frontend
session.

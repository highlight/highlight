---
title: SvelteKit Guide
slug: sveltekit
heading: SvelteKit Guide
createdAt: 2026-09-12T00:00:00.000Z
updatedAt: 2026-09-12T00:00:00.000Z
---

## Overview

Our Node.js SDK gives you access to server-side error monitoring, logging, and
tracing for your SvelteKit app, all paired with frontend session replay.

1. Use `H.init` from the `highlight.run` client SDK in `hooks.client.ts` to track
   session replay and client-side errors. See the
   [SvelteKit quick start](../3_browser/6_sveltekit.md) for details.
1. Use `H.init` from the `@highlight-run/node` SDK in `hooks.server.ts` to
   instrument the SvelteKit server.

## Installation

```shell
# with yarn
yarn add @highlight-run/node
```

## Server Instrumentation

All of the server-side setup below happens in your `hooks.server.ts` file. You
can find more details about this file in the SvelteKit docs
[here](https://kit.svelte.dev/docs/hooks#server-hooks).

### Initialize the SDK

Call `H.init` with your project ID. Grab your project ID from
[app.highlight.io/setup](https://app.highlight.io/setup).

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})
```

`H.init` accepts a `NodeOptions` object. `projectID` is required, and we
recommend setting `serviceName` and `environment`. Other options like
`serviceVersion` (ideally set to the deployed git SHA) and `otlpEndpoint` are
described in the [Node.js SDK docs](https://www.highlight.io/docs/sdk/nodejs).

### Instrument requests

Wrap your `handle` hook with `H.runWithHeaders` to create a span for every
server request. `H.runWithHeaders` reads the `x-highlight-request` header that
the client SDK attaches to requests (when `tracingOrigins` is enabled), so
backend traces, logs, and errors get paired with the frontend session.

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		async () => resolve(event),
	)
}
```

```hint
If you already have a `handle` hook (or use an integration that defines one),
compose Highlight's hook with the rest of your hooks using
[`sequence`](https://kit.svelte.dev/docs/hooks#server-hooks-sequence) from
`@sveltejs/kit/hooks`.
```

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

const handleHighlight: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		async () => resolve(event),
	)
}

export const handle = sequence(handleHighlight, /* your other handle hooks */)
```

### Capture server-side errors

Export the `handleError` hook to report errors thrown by your `load`
functions, form actions, and API routes (`+server.ts` files) to Highlight.

```typescript
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(`Unknown error: ${JSON.stringify(error)}`),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}
```

`H.parseHeaders` extracts the session and request identifiers from the
`x-highlight-request` header so that the error is attributed to the frontend
session that triggered it. Read more in
[Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping).

### Logging

Once `H.init` is called, any `console.log`, `console.warn`, and `console.error`
output from your server is captured as Highlight logs and mapped to the active
trace (when called within a request wrapped by `H.runWithHeaders`). If you
prefer to disable this, pass `disableConsoleRecording: true` to `H.init`.

### Putting it all together

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks'
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})

const handleHighlight: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		async () => resolve(event),
	)
}

export const handle = sequence(handleHighlight)

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(`Unknown error: ${JSON.stringify(error)}`),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}
```

### Verify it works

1. Run your app with `npm run dev`.
1. Throw an error in a server-side `load` function or form action:

```typescript
// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	throw new Error('SvelteKit server-side error!')
}
```

1. Visit the page in your browser and check that the error shows up in
   [Highlight](https://app.highlight.io/errors) alongside the session replay
   that triggered it.

## Deploying to serverless platforms

Some serverless platforms (like AWS Lambda) may drop data if the process is
frozen before the SDK flushes its queue. In these environments, catch errors
yourself and use `H.consumeAndFlush`, which reports the error and waits for
the SDK to flush before your function exits.

```typescript
// src/routes/api/example/+server.ts
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	try {
		throw new Error('example error!')
	} catch (error) {
		const parsed = H.parseHeaders(request.headers)

		await H.consumeAndFlush(
			error as Error,
			parsed.secureSessionId,
			parsed.requestId,
		)

		return new Response('ok', { status: 500 })
	}
}
```

## Advanced configuration

By default, the Node.js SDK's OpenTelemetry auto-instrumentations for `http`
and `fs` are disabled, so request-level spans come from the
`H.runWithHeaders` hook above. If you want to enable additional
auto-instrumentations (for example, to capture spans for outgoing `http`
requests made by your SvelteKit server), set the
`OTEL_NODE_ENABLED_INSTRUMENTATIONS` environment variable before your app
starts:

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS=http,fs npm run dev
```

To propagate trace context to downstream services, forward the
`x-highlight-request` header (or use `H.startWithHeaders` /
`H.runWithHeaders` with a callback that makes the outgoing request). Read
more in [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#distributed-tracing).

## Related steps

- [SvelteKit client quick start](../3_browser/6_sveltekit.md)
- [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping)
- [Node.js SDK docs](https://www.highlight.io/docs/sdk/nodejs)
- [Sourcemaps](../../general/6_product-features/2_error-monitoring/sourcemaps.md)

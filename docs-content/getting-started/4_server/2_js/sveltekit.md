---
title: SvelteKit
heading: SvelteKit Server Quick Start
metaTitle: SvelteKit Server Quick Start
slug: sveltekit
createdAt: 2026-06-05T00:00:00.000Z
updatedAt: 2026-06-05T00:00:00.000Z
---

This guide shows how to set up highlight.io server-side instrumentation for a SvelteKit app running on a Node-compatible adapter.

## Install the Node SDK

Install [@highlight-run/node](https://www.npmjs.com/package/@highlight-run/node) with your package manager.

```bash
npm install --save @highlight-run/node
```

## Initialize Highlight in your server hook

Initialize the Highlight Node SDK in `hooks.server.ts` with your project ID. Set `serviceName`, `serviceVersion`, and `environment` so traces, logs, and errors are grouped clearly in Highlight.

```ts
// hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders('sveltekit.handle', event.request.headers, () =>
		resolve(event),
	)
}
```

`H.runWithHeaders()` takes a span name, the incoming request headers, and a callback. When your frontend Highlight setup sends tracing headers, server traces can be connected back to the originating session and request.

## Report uncaught server errors

Use SvelteKit's `handleError` hook to report uncaught server-side errors. `H.parseHeaders()` extracts the Highlight session and request IDs from the active request.

```ts
// hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)
	const reportedError =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(reportedError, parsed.secureSessionId, parsed.requestId)
}
```

## Report manual errors

If you need to report exceptions outside of `handleError`, use the Highlight SDK with headers from the active SvelteKit request event.

```ts
const parsed = H.parseHeaders(event.request.headers)

H.consumeError(error, parsed.secureSessionId, parsed.requestId)
```

## Verify the setup

Create a temporary server endpoint that throws an error, then request it locally or in a deployed environment.

```ts
// src/routes/error/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	const { span } = H.startWithHeaders('sveltekit.server.route', request.headers)

	try {
		console.info('Highlight captured this server log from SvelteKit')
		throw new Error('sample SvelteKit server error!')
	} finally {
		span.end()
	}
}
```

After calling the route, verify that the error appears in [Highlight errors](https://app.highlight.io/errors). Then make a normal server request and check [Highlight traces](https://app.highlight.io/traces) for the SvelteKit request span.

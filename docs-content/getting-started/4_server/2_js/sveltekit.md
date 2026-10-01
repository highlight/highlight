---
title: SvelteKit
heading: SvelteKit Server Quick Start
slug: sveltekit
quickstart: true
---

# SvelteKit server instrumentation

Use the Node SDK from `hooks.server.ts` so SvelteKit server errors, logs, and traces are connected to the browser session created by the client SDK.

## Install the Node SDK

```bash
npm install @highlight-run/node
```

## Initialize Highlight in `hooks.server.ts`

```ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	environment: 'production',
	serviceName: 'sveltekit-server',
})

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(event.request.headers, async () => {
		const { span } = H.startWithHeaders('sveltekit.request', event.request.headers)

		try {
			return await resolve(event)
		} finally {
			span.end()
		}
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)
	H.consumeError(error as Error, parsed.secureSessionId, parsed.requestId)
}
```

## Verify the connection

Trigger a server route or action that logs or throws an error, then open the related session in Highlight. The server event should appear with the same session/request context as the browser request.
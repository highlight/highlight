---
title: SvelteKit server quickstart
heading: SvelteKit server quickstart
slug: sveltekit-server
---

# Instrument a Node.js SvelteKit server

This guide adds server-side traces and error reporting to a SvelteKit app running on Node.js. It uses the server-only `src/hooks.server.ts` file; it does not configure the browser SDK. For client-side setup, follow the [SvelteKit browser quickstart](../../3_browser/6_sveltekit.md). To connect browser sessions with backend errors, also follow the [full-stack mapping guide](../../2_frontend-backend-mapping.md).

## Before you start

- Use a Node.js runtime, such as [`adapter-node`](https://svelte.dev/docs/kit/adapter-node). The `@highlight-run/node` SDK is not for edge runtimes or static-only deployments.
- Get your Highlight project ID from the [setup page](https://app.highlight.io/setup).

## Install the Node SDK

Use your package manager to add `@highlight-run/node`:

```sh
npm install @highlight-run/node
```

## Add the server hooks

Create or update `src/hooks.server.ts`:

```ts
import { building, dev } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building && !H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-app',
		environment: dev ? 'development' : 'production',
	})
}

export const handle: Handle = async ({ event, resolve }) => {
	if (building || !H.isInitialized()) {
		return resolve(event)
	}

	// Pass a mutable copy: the Node SDK injects trace context into its headers argument.
	const headers = Object.fromEntries(event.request.headers)
	return H.runWithHeaders('sveltekit.handle', headers, () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
	if (building || !H.isInitialized()) {
		return
	}

	const headers = Object.fromEntries(event.request.headers)
	const { secureSessionId, requestId } = H.parseHeaders(headers)
	const reportedError = error instanceof Error ? error : new Error('Non-Error')
	H.consumeError(reportedError, secureSessionId, requestId)
}
```

The `building` check keeps the SDK out of prerendering. Keep this code in `hooks.server.ts`, rather than `hooks.ts`, so the Node SDK is not imported into browser code. `handleError` reports unexpected server errors; SvelteKit does not call it for expected errors raised with `error()` from `@sveltejs/kit`.

`Request.headers` is a Fetch `Headers` object. The example copies it to a plain object before calling `H.runWithHeaders`, because the SDK injects trace headers into the object it receives. This also leaves SvelteKit's request headers untouched.

## Check the integration

Run the app with its Node adapter and make a server request. In Highlight, check that the request appears under **Traces**. To verify error reporting locally, temporarily throw an `Error` from a server `load` function or endpoint, then check **Errors** for the matching request. Remove the temporary error after the check.

If traces appear without a session link, verify that the browser SDK is sending Highlight's request header and that your frontend requests preserve it through any proxy. The [full-stack mapping guide](../../2_frontend-backend-mapping.md) covers the browser-side configuration.

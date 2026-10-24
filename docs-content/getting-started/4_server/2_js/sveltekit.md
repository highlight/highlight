---
title: SvelteKit Node Server Instrumentation
heading: Instrumenting a SvelteKit Node server
slug: sveltekit
---

This guide uses the `@highlight-run/node` SDK in this repository with **SvelteKit 3** and a Node-compatible adapter, such as [`adapter-node`](https://svelte.dev/docs/kit/adapter-node). There is no dedicated `@highlight-run/sveltekit` package. A static-only deployment has no runtime server hooks; use the [browser guide](../../3_browser/6_sveltekit.md) for client instrumentation. Edge runtimes need a runtime-specific SDK instead of the Node SDK.

Highlight's hosted services have [migrated to LaunchDarkly](https://github.com/highlight/highlight/blob/main/blog-content/launchdarkly-migration.md). The example below is for an existing/self-hosted Highlight deployment with a configured OTLP endpoint. It does not configure LaunchDarkly Observability or send to the retired hosted service by default.

## Install and configure

From your SvelteKit application:

```bash
npm install @highlight-run/node
```

Set `HIGHLIGHT_PROJECT_ID` and `HIGHLIGHT_OTLP_ENDPOINT` in your Node server's environment. The endpoint is the base URL of your Highlight-compatible OTLP HTTP receiver. With `adapter-node`, pass these variables when starting `node build`; production does not automatically load your development `.env` file. Neither variable belongs in browser code. Missing configuration leaves instrumentation disabled in the example.

## Add the server hooks

Create or extend `src/hooks.server.ts`:

```typescript
// src/hooks.server.ts
import { building } from '$app/env'
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks'
import { H } from '@highlight-run/node'

const projectID = process.env.HIGHLIGHT_PROJECT_ID
const otlpEndpoint = process.env.HIGHLIGHT_OTLP_ENDPOINT

if (!building && projectID && otlpEndpoint && !H.isInitialized()) {
	H.init({ projectID, otlpEndpoint, serviceName: 'sveltekit-server' })
}

export const handle: Handle = async ({ event, resolve }) => {
	if (building || !H.isInitialized()) return resolve(event)

	const route = event.route.id ?? 'unmatched'
	const headers = Object.fromEntries(event.request.headers)
	return H.runWithHeaders(
		`${event.request.method} ${route}`,
		headers,
		async (span) => {
			const response = await resolve(event)
			span.setAttribute('http.response.status_code', response.status)
			return response
		},
	)
}

export const handleError: HandleServerError = ({ kind, error, event }) => {
	if (building || !H.isInitialized() || kind !== 'unknown') return

	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)
	// consumeError ends its span: use a child, not the request span.
	const { span } = H.startWithHeaders('sveltekit.error', {})
	H.consumeError(
		error instanceof Error
			? error
			: new Error('Non-Error thrown by application'),
		secureSessionId,
		requestId,
		{ 'sveltekit.route': event.route.id ?? 'unmatched' },
		{ span },
	)
	// Keep SvelteKit's default safe message in the response.
}
```

`handle` creates a span around SvelteKit's `resolve()` call, preserves its response, and records the returned HTTP status. Copy Web `Headers` into a plain object: the SDK's OpenTelemetry propagation injects fields into the carrier. The request span ends after `resolve()` returns, not after a streamed response finishes sending.

SvelteKit may turn errors in server loads, actions, and endpoints into a response inside `resolve()`. A `try/catch` around `resolve()` alone is insufficient. The [server `handleError` hook](https://svelte.dev/docs/kit/hooks#handleError) reports unexpected errors; SvelteKit 3 also sends expected and framework errors to that hook, so the example filters on `kind === 'unknown'`. Returned error responses still get a status attribute on the request span.

The error is recorded on a separate child span because this version of `H.consumeError` ends the span it uses. Returning nothing from `handleError` preserves SvelteKit's default response message. If your application adds required fields to `App.Error`, return those fields without exposing the original error or stack.

The `building` guard skips telemetry during prerendering. If you have another `handle` hook, combine it using [`sequence`](https://svelte.dev/docs/kit/hooks#Further-reading) and keep the telemetry hook outside the hooks whose work you want to observe. Merge with any existing `handleError` function rather than exporting two of them.

### Using SvelteKit 2

For a SvelteKit 2 application, import `building` from `$app/environment` and hook types from `@sveltejs/kit`. Use `status` instead of `kind` in the error hook's parameter, and replace `kind !== 'unknown'` with `status < 500` to omit framework 404s. Explicit SvelteKit HTTP errors do not invoke that hook in version 2. The Highlight SDK calls stay the same. See the [SvelteKit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3) when upgrading.

## Link browser sessions

Initialize the browser SDK separately using the [SvelteKit browser guide](../../3_browser/6_sveltekit.md), and set `tracingOrigins` to your own backend origins. This allows browser requests to carry `x-highlight-request` (`sessionId/requestId`). `H.runWithHeaders` associates request traces with that session, and `H.parseHeaders` supplies the IDs for error reporting. Requests without that header still produce server telemetry but do not have a browser session association. Browser `networkRecording` controls recording of network details; it is separate from choosing origins for correlation.

## Verify on a development deployment

Temporarily add an endpoint:

```typescript
// src/routes/highlight-check/+server.ts
export async function GET() {
	console.info('SvelteKit backend check')
	throw new Error('SvelteKit backend instrumentation check')
}
```

Call `/highlight-check`. Confirm that your application returns a safe 500 response, then inspect your configured receiver for the `GET /highlight-check` request span, the `sveltekit.error` child span and its exception, and the console log. Trigger it through an instrumented browser request to verify session association too. Remove the endpoint after testing.

A missing route or a deliberate SvelteKit `error(404, ...)` should produce a 404 request span without an unexpected-error report. Check the configured receiver URL, server environment, browser origin configuration, and `x-highlight-request` header if these checks differ. A Node server should remain running long enough for the SDK's batched export; short-lived/serverless processes need a lifecycle-specific flushing strategy rather than assuming a returned response guarantees delivery.

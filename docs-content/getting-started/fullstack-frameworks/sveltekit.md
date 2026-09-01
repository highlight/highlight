---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-05-12T00:00:00.000Z
updatedAt: 2026-05-12T00:00:00.000Z
---

## Overview

Highlight works well with SvelteKit once both halves are wired up:

1. `highlight.run` in `src/hooks.client.ts` for session replay and browser errors
2. `@highlight-run/node` in `src/hooks.server.ts` for server errors, logs, and traces

If you already have auth, redirects, or other request logic in `hooks.server.ts`, keep it there. You are just wrapping the request lifecycle with Highlight, not replacing it.

## Install

```bash
# with yarn
yarn add highlight.run @highlight-run/node

# with npm
npm install highlight.run @highlight-run/node

# with pnpm
pnpm add highlight.run @highlight-run/node
```

## Client instrumentation

Start in `src/hooks.client.ts`:

```ts
// src/hooks.client.ts
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
	environment: 'production',
	version: 'commit:abcdefg12345',
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
		urlBlocklist: [
			'https://www.googleapis.com/identitytoolkit',
			'https://securetoken.googleapis.com',
		],
	},
})
```

`tracingOrigins` and `networkRecording` matter here because they let Highlight attach the `x-highlight-request` header. That is what ties a browser session to the work your SvelteKit server does for that request.

If you want a longer explanation of that flow, see [Fullstack Mapping](../2_frontend-backend-mapping.md).

## Server instrumentation

If your app runs on a server adapter, add Highlight to `src/hooks.server.ts`.

```ts
// src/hooks.server.ts
import { H, type NodeOptions } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightConfig: NodeOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
}

if (!H.isInitialized()) {
	H.init(highlightConfig)
}

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		() => resolve(event),
		{
			attributes: {
				route: event.route.id ?? event.url.pathname,
			},
		},
	)
}

export const handleError: HandleServerError = async ({
	error,
	event,
	status,
	message,
}) => {
	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)
	const reportedError =
		error instanceof Error ? error : new Error(message)

	H.consumeError(reportedError, secureSessionId, requestId, {
		route: event.route.id ?? event.url.pathname,
		status,
	})
}
```

This does two useful things:

1. Every server request gets a parent span through `H.runWithHeaders(...)`
2. Unexpected server errors still show up in Highlight with the same session and request IDs

If you already export `handle`, just wrap your existing `resolve(event)` call the same way. If you already export `handleError`, keep your current logic and add `H.consumeError(...)` inside it.

If your site is fully prerendered with `adapter-static`, there is no long-running server process to instrument, so this section does not apply.

## CSS paths in SvelteKit

SvelteKit can emit relative stylesheet URLs, which can get in the way of Highlight fetching stylesheets for replay. If you see missing styling in recordings, set `kit.paths.relative = false` in `svelte.config.js`.

```js
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

## Identify users

If your app has login or signup flows, identify the signed-in user after auth finishes:

```ts
import { H } from 'highlight.run'

H.identify('jay@highlight.io', {
	id: 'very-secure-id',
	plan: 'pro',
})
```

That makes session search much more useful when you are trying to connect a backend failure to one specific customer.

## Verifying installation

1. Open your app and confirm a new session shows up in [Highlight Sessions](https://app.highlight.io/sessions)
2. Trigger a server-side exception and confirm it appears in [Highlight Errors](https://app.highlight.io/errors)
3. Visit the [Traces page](https://app.highlight.io/traces) and look for the `serviceName` you used in `hooks.server.ts`

If you only see browser sessions but no traces, the usual culprit is that `src/hooks.server.ts` was never added, or your app is deployed with a static adapter.

## Sourcemaps

Readable stack traces are much nicer than minified ones. If you upload sourcemaps in CI, Highlight can show the original source in browser error stacks.

See the [sourcemap docs](../3_browser/7_replay-configuration/sourcemaps.md) for the full setup.

## Troubleshooting

### I see sessions, but not server traces

Check that your app is actually using a server adapter, and make sure `H.runWithHeaders(...)` wraps the request in `src/hooks.server.ts`.

### I already have auth logic in `handle`

That is fine. Keep your existing logic. Just wrap the part that calls `resolve(event)`:

```ts
export const handle: Handle = async ({ event, resolve }) => {
	// your existing auth or locals logic here

	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		() => resolve(event),
	)
}
```

### My server errors still are not linked to the session

Double-check that the browser SDK has both `tracingOrigins` and `networkRecording.enabled` turned on. Without those, the request header that ties frontend and backend together will never be sent.

### I only want to capture server errors

You can do that, but most teams get the most value when they keep both the browser SDK and the server SDK on. The whole point is seeing the failing request together with the replay that led up to it.

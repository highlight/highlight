---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2024-03-14T00:00:00.000Z
updatedAt: 2024-03-14T00:00:00.000Z
---

## Overview

Highlight gives you frontend session replays and server-side monitoring for your
SvelteKit app, all-in-one.

1. Use `H.init` from `highlight.run` in `hooks.client.ts` to track session replay and client-side errors.
1. Use `H.init` from `@highlight-run/node` in `hooks.server.ts` to instrument SvelteKit's Node.js server.

## Installation

```shell
# with yarn
yarn add highlight.run @highlight-run/node

# with npm
npm install highlight.run @highlight-run/node

# with pnpm
pnpm add highlight.run @highlight-run/node
```

`highlight.run` powers client-side session replay; `@highlight-run/node` instruments the
SvelteKit server. If you only need frontend monitoring, you can install `highlight.run`
on its own — see the [SvelteKit client quickstart](https://www.highlight.io/docs/getting-started/browser/sveltekit).

## Client Instrumentation

Initialize highlight.io in your `hooks.client.ts` file. Setting `tracingOrigins` and
`networkRecording` lets Highlight attach a header to outgoing requests so your frontend
sessions are paired with the backend errors and traces they triggered.

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

```javascript
// src/hooks.client.ts
import { H } from 'highlight.run'
import { PUBLIC_HIGHLIGHT_PROJECT_ID } from '$env/static/public'

H.init(PUBLIC_HIGHLIGHT_PROJECT_ID, {
	serviceName: 'my-sveltekit-frontend',
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})
```

You can also report client-side errors from the
[`handleError`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror) client hook:

```javascript
// src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit'

export const handleError: HandleClientError = ({ error }) => {
	if (error instanceof Error) {
		H.consumeError(error)
	}
}
```

## Server Instrumentation

SvelteKit runs its server on Node.js, so you instrument the backend with the
`@highlight-run/node` SDK from your [server hooks](https://kit.svelte.dev/docs/hooks#server-hooks)
in `src/hooks.server.ts`.

1. Call `H.init` once when the module is loaded.
1. Report uncaught server errors from the `handleError` hook using `H.consumeError`.
1. Wrap requests with `H.runWithHeaders` in the `handle` hook so traces and errors are tied
   back to the originating frontend session.

Read your project ID from
[`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private) so it is
never bundled into the client.

```javascript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { HIGHLIGHT_PROJECT_ID } from '$env/static/private'

H.init({
	projectID: HIGHLIGHT_PROJECT_ID,
	serviceName: 'my-sveltekit-backend',
})

export const handleError: HandleServerError = ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)

	if (error instanceof Error) {
		H.consumeError(error, secureSessionId, requestId)
	} else {
		H.consumeError(
			new Error(`Unknown server error: ${JSON.stringify(error)}`),
			secureSessionId,
			requestId,
		)
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		async () => resolve(event),
	)
}
```

`H.parseHeaders` reads the `x-highlight-request` header that the client SDK sets when
`tracingOrigins` is enabled, so the `secureSessionId`/`requestId` it returns link each
server error to the exact session that caused it. See
[Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping)
for more on how frontend and backend telemetry are connected.

If you already export a `handle` hook, compose Highlight's wrapper with
[`sequence`](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence) rather than
replacing your existing logic:

```javascript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks'

const withHighlight: Handle = async ({ event, resolve }) =>
	H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		async () => resolve(event),
	)

export const handle = sequence(withHighlight, myExistingHandle)
```

## Verify your installation

Trigger an error from a server `load` function or endpoint, then check your
[Highlight dashboard](https://app.highlight.io/errors) for the new error. Because the
request carries the session header, the error opens alongside the frontend session that
produced it. Don't see anything? Send us a message in
[our community](https://highlight.io/community) and we can help debug.

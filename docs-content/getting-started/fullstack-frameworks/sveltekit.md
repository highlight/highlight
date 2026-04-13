---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2024-04-12T00:00:00.000Z
updatedAt: 2024-04-12T00:00:00.000Z
---

## Overview

Highlight provides full-stack observability for SvelteKit — session replay and client-side errors on the frontend, plus error monitoring, distributed tracing, and logging on the server. Backend errors are automatically correlated to the frontend session that triggered them.

1. Use `H.init` in `src/hooks.client.ts` to capture session replay and client-side errors.
2. Use `H.init` and `H.runWithHeaders` in `src/hooks.server.ts` to instrument SvelteKit's Node.js server and link backend traces to the originating frontend session.

## Installation

```shell
# npm
npm install highlight.run @highlight-run/node

# yarn
yarn add highlight.run @highlight-run/node

# pnpm
pnpm add highlight.run @highlight-run/node
```

## Client Instrumentation

Add `H.init` to `src/hooks.client.ts`. This file runs once when the app starts in the browser.

Configure `tracingOrigins` and `networkRecording` so that Highlight can correlate frontend and backend errors. Use SvelteKit's [public environment variables](https://kit.svelte.dev/docs/modules#$env-static-public) to safely expose your Project ID to the browser bundle.

```typescript
// src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit'
import { H } from 'highlight.run'
import { PUBLIC_HIGHLIGHT_PROJECT_ID } from '$env/static/public'

H.init(PUBLIC_HIGHLIGHT_PROJECT_ID, {
    environment: 'production',
    serviceName: 'my-sveltekit-frontend',
    tracingOrigins: true,
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
})

export const handleError: HandleClientError = ({ error }) => {
    H.consumeError(error as Error)
}
```

## Server Instrumentation

All server-side setup lives in `src/hooks.server.ts`. Use SvelteKit's [private environment variables](https://kit.svelte.dev/docs/modules#$env-static-private) to keep your Project ID off the client bundle.

### 1. Initialize the Node SDK

```typescript
import { H } from '@highlight-run/node'
import { HIGHLIGHT_PROJECT_ID } from '$env/static/private'

H.init({
    projectID: HIGHLIGHT_PROJECT_ID,
    serviceName: 'my-sveltekit-backend',
    environment: 'production',
})
```

### 2. Wrap the request handler

The `handle` hook runs on every server request. Wrap it with `H.runWithHeaders` to propagate the session context from the frontend so that backend traces appear linked to the correct session.

> **Note:** Pass `Object.fromEntries(event.request.headers)` — `H.runWithHeaders` expects a plain object, not a `Headers` instance.

```typescript
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
    return await H.runWithHeaders(
        `${event.request.method} ${event.url.pathname}`,
        Object.fromEntries(event.request.headers),
        () => resolve(event),
    )
}
```

### 3. Report server errors

The `handleError` hook is called for any unhandled error thrown during loading or rendering. Use `H.parseHeaders` to extract the session context and link the error to the triggering frontend session.

```typescript
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
    const { secureSessionId, requestId } = H.parseHeaders(
        Object.fromEntries(event.request.headers),
    )
    H.consumeError(error as Error, secureSessionId, requestId)
    console.error(error)
}
```

### Complete `hooks.server.ts`

```typescript
// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'
import { HIGHLIGHT_PROJECT_ID } from '$env/static/private'

H.init({
    projectID: HIGHLIGHT_PROJECT_ID,
    serviceName: 'my-sveltekit-backend',
    environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
    return await H.runWithHeaders(
        `${event.request.method} ${event.url.pathname}`,
        Object.fromEntries(event.request.headers),
        () => resolve(event),
    )
}

export const handleError: HandleServerError = ({ error, event }) => {
    const { secureSessionId, requestId } = H.parseHeaders(
        Object.fromEntries(event.request.headers),
    )
    H.consumeError(error as Error, secureSessionId, requestId)
    console.error(error)
}
```

## API Routes

To capture errors and traces in SvelteKit API routes (`+server.ts`), wrap your handlers with `H.runWithHeaders`:

```typescript
// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
    return await H.runWithHeaders(
        'GET /api/example',
        Object.fromEntries(request.headers),
        async () => {
            return new Response(JSON.stringify({ ok: true }), {
                headers: { 'content-type': 'application/json' },
            })
        },
    )
}
```

## Load Functions

Errors thrown in `+page.server.ts` load functions are caught by `handleError` automatically. To manually capture and report an error before re-throwing:

```typescript
// src/routes/+page.server.ts
import { H } from '@highlight-run/node'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
    try {
        // your data fetching
    } catch (error) {
        const { secureSessionId, requestId } = H.parseHeaders(
            Object.fromEntries(request.headers),
        )
        H.consumeError(error as Error, secureSessionId, requestId)
        throw error // re-throw so SvelteKit renders the error page
    }
}
```

## Logging

The Highlight Node SDK automatically captures `console.log`, `console.warn`, and `console.error` calls on the server. No additional configuration is needed — logs appear in your [Highlight Logs dashboard](https://app.highlight.io/logs), linked to the relevant session and trace.

## Relative CSS Paths

SvelteKit may generate relative CSS paths which can interfere with Highlight's ability to fetch stylesheets for session replay. Disable relative paths in `svelte.config.js`:

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

## Node Adapter

Server-side instrumentation requires SvelteKit to run in a Node.js environment. If you're using a non-Node adapter, switch to [`@sveltejs/adapter-node`](https://kit.svelte.dev/docs/adapter-node):

```shell
npm install @sveltejs/adapter-node
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        paths: {
            relative: false,
        },
    },
}

export default config
```

## Verify Installation

1. Start your dev server and open the app in a browser.
2. Check your [Highlight Sessions dashboard](https://app.highlight.io/sessions) — a new session should appear within seconds.
3. Throw a client-side error (e.g. `throw new Error('client test')` in a `+page.svelte` component) and confirm it appears in the [Errors dashboard](https://app.highlight.io/errors).
4. Throw a server-side error in a load function and confirm it is linked to the same frontend session.
5. Check [Highlight Logs](https://app.highlight.io/logs) — `console.log` calls from the server should appear automatically.

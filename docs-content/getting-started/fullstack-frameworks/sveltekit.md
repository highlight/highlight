---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-02-10T00:00:00.000Z
updatedAt: 2026-02-10T00:00:00.000Z
---

## Overview

Highlight provides both frontend session replays and server-side monitoring for SvelteKit applications.

1. Use `H.init()` from `highlight.run` in `hooks.client.ts` to track session replay and client-side errors.
1. Use `H.init()` from `@highlight-run/node` in `hooks.server.ts` to instrument SvelteKit's server-side hooks for error monitoring, logging, and tracing.

## Installation

```shell
# with npm
npm install highlight.run @highlight-run/node
```

## Client Instrumentation

Initialize highlight.io in `hooks.client.ts` (or `hooks.client.js`). This file runs once when the application starts in the browser. See the [SvelteKit hooks docs](https://kit.svelte.dev/docs/hooks) for more details.

Configure `tracingOrigins` and `networkRecording` so that Highlight can pair frontend and backend errors.

Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup).

```typescript
// src/hooks.client.ts
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
    environment: 'production',
    version: 'commit:abcdefg12345',
    tracingOrigins: true,
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
})
```

Optionally configure `excludedHostnames` to block a full or partial hostname. For example, `excludedHostnames: ['localhost']` would not initialize Highlight on `localhost`.

### Confirm CSS is served by absolute path

SvelteKit may generate CSS paths that are relative which may interfere with Highlight's logic to fetch stylesheets. Update your `svelte.config.js` to disable relative paths. [See the SvelteKit docs here for more details](https://kit.svelte.dev/docs/configuration#paths).

```javascript
/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        paths: {
            relative: false
        }
    }
};

export default config;
```

## Server Instrumentation

Initialize the Highlight Node SDK in `hooks.server.ts` to capture server-side errors, logs, and traces. SvelteKit provides a [`handleError`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror) hook that is called when an unexpected error is thrown during loading or rendering.

### 1. Initialize the Node SDK

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
    projectID: '<YOUR_PROJECT_ID>',
    serviceName: 'my-sveltekit-app',
    environment: 'production',
})
```

### 2. Handle server errors

Export a `handleError` hook to report server-side errors to Highlight. The hook receives the error and the event (containing the request) so that errors can be correlated with frontend sessions.

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

H.init({
    projectID: '<YOUR_PROJECT_ID>',
    serviceName: 'my-sveltekit-app',
    environment: 'production',
})

export const handleError: HandleServerError = ({ error, event }) => {
    const parsed = H.parseHeaders(
        Object.fromEntries(event.request.headers),
    )

    if (error instanceof Error) {
        H.consumeError(
            error,
            parsed?.secureSessionId,
            parsed?.requestId,
        )
    } else {
        H.consumeError(
            new Error(`Unknown error: ${JSON.stringify(error)}`),
            parsed?.secureSessionId,
            parsed?.requestId,
        )
    }

    console.error(error)
}
```

### 3. Instrument the request handler (optional)

If you want to add tracing or custom attributes to each request, you can use the [`handle`](https://kit.svelte.dev/docs/hooks#server-hooks-handle) hook to wrap all incoming requests.

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
    projectID: '<YOUR_PROJECT_ID>',
    serviceName: 'my-sveltekit-app',
    environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
    const parsed = H.parseHeaders(
        Object.fromEntries(event.request.headers),
    )

    // Log each request for visibility
    console.log(`${event.request.method} ${event.url.pathname}`, {
        secureSessionId: parsed?.secureSessionId,
        requestId: parsed?.requestId,
    })

    const response = await resolve(event)
    return response
}

export const handleError: HandleServerError = ({ error, event }) => {
    const parsed = H.parseHeaders(
        Object.fromEntries(event.request.headers),
    )

    if (error instanceof Error) {
        H.consumeError(
            error,
            parsed?.secureSessionId,
            parsed?.requestId,
        )
    } else {
        H.consumeError(
            new Error(`Unknown error: ${JSON.stringify(error)}`),
            parsed?.secureSessionId,
            parsed?.requestId,
        )
    }

    console.error(error)
}
```

### 4. Report errors from API routes

In SvelteKit `+server.ts` API routes, you can manually report errors to Highlight.

```typescript
// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
    try {
        // your logic here
        return json({ message: 'success' })
    } catch (e) {
        const parsed = H.parseHeaders(
            Object.fromEntries(request.headers),
        )

        if (e instanceof Error) {
            H.consumeError(e, parsed?.secureSessionId, parsed?.requestId)
        }

        throw error(500, 'Internal server error')
    }
}
```

## Logging

With the Node SDK initialized, your server-side `console.*` calls are automatically reported to Highlight. See the [JS logging setup guide](https://www.highlight.io/docs/getting-started/backend-logging/js/overview) for more details.

## Verify

After instrumenting both client and server:

1. Start your SvelteKit app and trigger a client-side error to verify session replay and error tracking.
2. Throw an error in a server-side `load` function or API route to verify backend error reporting.
3. Check that errors appear in [app.highlight.io/errors](https://app.highlight.io/errors) and are linked to the correct session.

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details on how frontend and backend errors are correlated.

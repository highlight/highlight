---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2024-04-12T00:00:00.000Z
updatedAt: 2024-04-12T00:00:00.000Z
---

## Overview

Our SvelteKit instrumentation gives you access to frontend session replays and server-side monitoring, all-in-one.

1.  Use `H.init` in `src/hooks.client.ts` to track session replay and client-side errors.
2.  Use `H.init` and `H.runWithHeaders` in `src/hooks.server.ts` to instrument SvelteKit's Node.js server.

## Installation

```shell
# with yarn
yarn add highlight.run @highlight-run/node
```

## Client Instrumentation

To instrument your SvelteKit frontend, add `H.init` to your `src/hooks.client.ts` file. This will capture session replays and client-side errors.

You can use SvelteKit's [environment variables](https://kit.svelte.dev/docs/modules#$env-static-public) to manage your Project ID.

```typescript
// src/hooks.client.ts
import { H } from 'highlight.run';
import { PUBLIC_HIGHLIGHT_PROJECT_ID } from '$env/static/public';

H.init(PUBLIC_HIGHLIGHT_PROJECT_ID, {
    serviceName: "my-sveltekit-frontend",
    tracingOrigins: true,
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
});

/** @type {import('@sveltejs/kit').HandleClientError} */
export const handleError = ({ error }) => {
    H.consumeError(error as Error);
};
```

## Server Instrumentation

To instrument your SvelteKit backend, use the `handle` hook in `src/hooks.server.ts`. This allows Highlight to track server-side errors and link them to your frontend sessions.

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node';
import { HIGHLIGHT_PROJECT_ID } from '$env/static/private';

H.init({ 
    projectID: HIGHLIGHT_PROJECT_ID,
    serviceName: "my-sveltekit-backend",
});

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    return await H.runWithHeaders('sveltekit-server', event.request.headers, async () => {
        return await resolve(event);
    });
};

/** @type {import('@sveltejs/kit').HandleServerError} */
export const handleError = ({ error, event }) => {
    const { secureSessionId, requestId } = H.parseHeaders(event.request.headers);
    H.consumeError(error as Error, secureSessionId, requestId);
};
```

## Relative CSS Paths

SvelteKit may generate relative CSS paths which can interfere with Highlight's ability to fetch stylesheets for session replay. We recommend disabling relative paths in your `svelte.config.js`.

```javascript
// svelte.config.js
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

## Verify Installation

1.  Check your [Highlight sessions dashboard](https://app.highlight.io/sessions) for a new session.
2.  Trigger a client-side error (e.g., `throw new Error("client error")` in a Svelte component).
3.  Trigger a server-side error (e.g., `throw new Error("server error")` in a `+page.server.ts` loader).
4.  Confirm both errors appear in the [errors dashboard](https://app.highlight.io/errors) and are linked to the session.

---
toc: SvelteKit
title: SvelteKit Backend Monitoring
slug: sveltekit
---

# Monitor a SvelteKit Node server

Use `@highlight-run/node` in `src/hooks.server.ts` to capture unexpected server errors and request traces. This example targets **SvelteKit 2 with a Node runtime**, such as `@sveltejs/adapter-node`. It does not establish compatibility with Cloudflare Workers or another Edge runtime. Static/prerendered responses do not run a request hook on each visit.

## 1. Install and configure

```sh
npm install @highlight-run/node
```

Set `HIGHLIGHT_PROJECT_ID` to your project ID in your server deployment environment. If using a local `.env` file, keep it out of version control. For a built adapter-node server, export the environment variable before launching it; do not assume the production server loads `.env` automatically.

This example leaves monitoring disabled when the variable is absent or during SvelteKit's build phase. In production, verify the variable is present rather than interpreting a working application as proof that monitoring is enabled.

## 2. Add the server hooks

If you already have a `handle` hook, combine it with this one using [SvelteKit's sequence helper](https://svelte.dev/docs/kit/@sveltejs-kit-hooks#sequence). Merge `handleError` with any existing error reporting rather than overwriting it.

```ts
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { H } from '@highlight-run/node';
import type { Handle, HandleServerError } from '@sveltejs/kit';

const enabled = !building && Boolean(env.HIGHLIGHT_PROJECT_ID);
if (enabled) {
  H.init({
    projectID: env.HIGHLIGHT_PROJECT_ID!,
    serviceName: 'sveltekit-backend-example',
    environment: env.NODE_ENV ?? 'development',
    ...(env.HIGHLIGHT_OTLP_ENDPOINT ? { otlpEndpoint: env.HIGHLIGHT_OTLP_ENDPOINT } : {})
  });
}

export const handle: Handle = async ({ event, resolve }) => {
  if (!enabled) return resolve(event);
  // Stable route IDs avoid putting user identifiers or query strings in span names.
  return H.runWithHeaders(
    `${event.request.method} ${event.route.id ?? 'unmatched'}`,
    { 'x-highlight-request': event.request.headers.get('x-highlight-request') ?? undefined },
    async (span) => {
      const response = await resolve(event);
      span.setAttribute('http.response.status_code', response.status);
      return response;
    }
  );
};

export const handleError: HandleServerError = async ({ error, event, status }) => {
  if (enabled) {
    const headers = {
      'x-highlight-request': event.request.headers.get('x-highlight-request') ?? undefined
    };
    const { secureSessionId, requestId } = H.parseHeaders(headers);
    // The SDK ends the active span when consuming an error. A separate child
    // span keeps the request span alive until resolve supplies the HTTP status.
    await H.runWithHeaders('sveltekit.error', headers, () =>
      H.consumeAndFlush(
        error instanceof Error ? error : new Error('Unexpected non-Error server exception'),
        secureSessionId,
        requestId,
        { route: event.route.id ?? 'unmatched', status }
      )
    );
  }
  // Return a safe message; never return the original error/stack to a visitor.
  return { message: 'An unexpected server error occurred.' };
};
```

The SDK initializes once for this server module, not on every request. The request hook returns the original response and records its status. It uses the route pattern rather than a raw URL as the span name.

The current SDK ends the active span in `consumeError` (also used by `consumeAndFlush`). The separate `sveltekit.error` child span therefore prevents error capture from ending the parent request span before its final HTTP status is known.

`handleError` reports unexpected exceptions. SvelteKit's deliberate `error(400, ...)` responses and redirects are not unexpected exceptions and should not be reported by adding an unconditional error call to `handle`. Only a generic message is returned to the visitor; the original exception remains in server monitoring.

`HIGHLIGHT_OTLP_ENDPOINT` is optional. Leave it unset for the SDK's hosted endpoint. The local verifier sets it to its temporary loopback collector; that collector is not a production service.

## 3. Link a browser session

Configure the [SvelteKit browser SDK](../../browser/svelte-kit) separately and set its `tracingOrigins` to the **trusted origins you control**. Browser requests to those origins can carry `x-highlight-request` in the SDK's `session/request` format. The server hook extracts that header and passes it to the Node SDK.

Server-originated requests without this header still produce error events; they simply have no browser session association. Treat the header as observability metadata, never authentication or authorization.

## 4. Verify an unexpected error

Temporarily add `src/routes/api/highlight-test/+server.ts` in a development environment:

```ts
export function GET(): Response {
  throw new Error('highlight-sveltekit-controlled-test');
}
```

Run the Node server with your project ID and request `/api/highlight-test`. Expect an HTTP 500 with the generic message and an error in the correct Highlight project/environment. Make a browser request from an initialized, trusted origin to verify session linking. Remove the test route before deployment.

If the dashboard stays empty, check the project ID, environment, server-side network access to the SDK's OTLP endpoint, and whether the route actually runs on Node. A prerendered page or a handled 400 response is not a valid unexpected-error test.

## Reproduced verification

The accompanying standalone example was checked on Windows with Node v24.15.0, SvelteKit 2.70.3, adapter-node 5.5.7, Svelte 5.57.3, and `@highlight-run/node` 3.12.1. Type checking returned zero errors/warnings, and the production build passed.

Its verifier runs the **real built Node server and real SDK**, capturing exports with a temporary local HTTP OTLP receiver. It checks:

- 200 response preserved
- unexpected 500 returns a safe message
- real SDK exports exception and session context to local OTLP collector
- expected 400 does not add an unexpected-error event
- unexpected exception works without browser correlation header
- request trace is exported for a successful route
- 500 request span retains its final HTTP status after error capture
- correlated and uncorrelated error spans keep separate session attribution

This proves local request/error hook behavior and telemetry export in the listed environment. It does not prove hosted dashboard ingestion, browser replay integration, a serverless runtime, or Edge compatibility.


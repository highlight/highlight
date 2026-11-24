---
title: SvelteKit
heading: Using highlight.io with SvelteKit
slug: svelte-kit
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["svelte-kit"]}/>

## Backend instrumentation

The quickstart above instruments the browser session. To tie server-side errors and
traces to those sessions, instrument your SvelteKit backend as well. SvelteKit's server
runtime is Node.js, so the backend is instrumented with the Node.js SDK
(`@highlight-run/node`) — there is no separate SvelteKit-specific package.

### 1. Install the Node.js SDK

```bash
npm install @highlight-run/node
```

### 2. Initialize Highlight in `hooks.server.ts`

SvelteKit runs server hooks for every request. Initialize Highlight once at module scope
in `src/hooks.server.ts` so the client is reused across requests:

```ts
// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: process.env.HIGHLIGHT_PROJECT_ID as string,
	serviceName: 'my-sveltekit-app',
	serviceVersion: process.env.SERVICE_VERSION,
	environment: process.env.NODE_ENV ?? 'development',
})
```

`H.init()` takes a `NodeOptions` object. `projectID` is required — grab it from
[app.highlight.io/setup](https://app.highlight.io/setup). `serviceName`,
`serviceVersion` and `environment` are optional but recommended, since they let you
distinguish services and deploys in the dashboard.

### 3. Wrap requests with the `handle` hook

`H.runWithHeaders()` starts a span for the request and propagates the Highlight session
and request headers, so backend traces link back to the frontend session that triggered
them:

```ts
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		event.request.headers,
		() => resolve(event),
	)
}
```

`event.request.headers` is a Fetch `Headers` instance, which the SDK accepts directly.

### 4. Report errors with the `handleError` hook

SvelteKit's `handleError` hook runs for unhandled errors in server code. Extract the
Highlight context from the request headers with `H.parseHeaders()` and report the error
with `H.consumeError()`:

```ts
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({
	error,
	event,
	status,
	message,
}) => {
	const parsed = H.parseHeaders(event.request.headers)

	H.consumeError(
		error instanceof Error ? error : new Error(String(error)),
		parsed.secureSessionId,
		parsed.requestId,
		{ 'http.status_code': status },
	)

	console.error(message)
}
```

### 5. Flush telemetry on serverless runtimes

If you deploy to a serverless adapter (Vercel, Netlify, Cloudflare, and so on), flush
pending telemetry before the invocation ends so nothing is dropped:

```ts
await H.flush()
```

### 6. Verify the setup

Trigger an error from a server endpoint or a `+page.server.ts` load function, then open
[app.highlight.io/errors](https://app.highlight.io/errors). The error should show up
under the service name you configured, linked to the originating session when the
request carried Highlight headers.

### Environment variables

| Variable               | Required | Description                                              |
| ---------------------- | -------- | -------------------------------------------------------- |
| `HIGHLIGHT_PROJECT_ID` | yes      | Your Highlight project ID.                               |
| `SERVICE_VERSION`      | no       | Deployed git SHA, attached to every error and trace.     |
| `NODE_ENV`             | no       | `development`, `staging` or `production`.                |
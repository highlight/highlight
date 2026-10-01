---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-04-16T00:00:00.000Z
updatedAt: 2026-04-16T00:00:00.000Z
---

## Overview

Our SvelteKit integration gives you access to frontend session replays and server-side monitoring, all-in-one.

1. Use `H.init` in `hooks.client.ts` to track session replay and client-side errors.
1. Use `H.init` from `@highlight-run/node` in `hooks.server.ts` to instrument SvelteKit's server.

## Installation

```shell
# with npm
npm install highlight.run @highlight-run/node

# with yarn
yarn add highlight.run @highlight-run/node

# with pnpm
pnpm add highlight.run @highlight-run/node
```

## Client Instrumentation

Initialize Highlight in your `hooks.client.ts` file. This file runs once when the client-side app starts.

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details on pairing frontend and backend sessions.

```typescript
// hooks.client.ts
import { H } from 'highlight.run';
import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = () => {
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
	});
};
```

### Error Handling

SvelteKit provides an `handleError` hook for client-side errors. You can forward these to Highlight:

```typescript
// hooks.client.ts
import { H } from 'highlight.run';
import type { ClientInit, HandleClientError } from '@sveltejs/kit';

export const init: ClientInit = () => {
	H.init('<YOUR_PROJECT_ID>', {
		environment: 'production',
		tracingOrigins: true,
		networkRecording: {
			enabled: true,
			recordHeadersAndBody: true,
		},
	});
};

export const handleError: HandleClientError = ({ error, event }) => {
	H.consumeError(error as Error);
};
```

## Server Instrumentation

Use `@highlight-run/node` in your `hooks.server.ts` to capture server-side errors and link them to frontend sessions.

```typescript
// hooks.server.ts
import { H } from '@highlight-run/node';
import type { Handle, HandleServerError } from '@sveltejs/kit';

const HIGHLIGHT_PROJECT_ID = '<YOUR_PROJECT_ID>';

H.init({
	projectID: HIGHLIGHT_PROJECT_ID,
	environment: 'production',
	serviceName: 'my-sveltekit-app',
});

// Handle server errors
export const handleError: HandleServerError = ({ error, event }) => {
	const sessionId = event.request.headers.get('x-highlight-request');
	const parsed = sessionId?.split('/');

	if (error instanceof Error) {
		H.consumeError(error, parsed?.[0], parsed?.[1]);
	}

	console.error('Server error:', error);

	return {
		message: 'An unexpected error occurred.',
	};
};

// Inject session ID into locals for server-side linking
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	return response;
};
```

### Linking Frontend and Backend Sessions

Highlight automatically passes session information via request headers when `tracingOrigins` is configured on the client. On the server side, use `H.parseHeaders` to extract session IDs:

```typescript
// hooks.server.ts
import { H } from '@highlight-run/node';
import type { Handle, HandleServerError } from '@sveltejs/kit';

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	environment: 'production',
	serviceName: 'my-sveltekit-app',
});

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers);
	const parsed = H.parseHeaders(headers);

	if (error instanceof Error) {
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId);
	}

	return {
		message: 'An unexpected error occurred.',
	};
};
```

### API Route Error Handling

For SvelteKit API routes (`+server.ts`), wrap your handlers to capture errors:

```typescript
// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	try {
		// Your API logic here
		const data = await fetchData();
		return json(data);
	} catch (error) {
		const headers = Object.fromEntries(request.headers);
		const parsed = H.parseHeaders(headers);

		if (error instanceof Error) {
			H.consumeError(error, parsed?.secureSessionId, parsed?.requestId);
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
```

### Server Load Functions

Errors in `load` functions are automatically caught by SvelteKit's `handleError` hook. For manual error reporting in loaders:

```typescript
// src/routes/dashboard/+page.server.ts
import { H } from '@highlight-run/node';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	try {
		const data = await fetchDashboardData();
		return { data };
	} catch (error) {
		const headers = Object.fromEntries(request.headers);
		const parsed = H.parseHeaders(headers);

		if (error instanceof Error) {
			H.consumeError(error, parsed?.secureSessionId, parsed?.requestId);
		}

		return { data: null, error: 'Failed to load dashboard' };
	}
};
```

## Configuration

### Source Maps

For better error stack traces, upload your source maps to Highlight:

```shell
npx @highlight-run/sourcemap-uploader upload --path ./build --project-id <YOUR_PROJECT_ID>
```

### Environment Variables

Store your project ID in environment variables instead of hardcoding it:

```shell
# .env
HIGHLIGHT_PROJECT_ID=your_project_id_here
```

Then reference it in your hooks:

```typescript
// hooks.client.ts
H.init(import.meta.env.VITE_HIGHLIGHT_PROJECT_ID, { ... });

// hooks.server.ts
H.init({
	projectID: process.env.HIGHLIGHT_PROJECT_ID,
	...
});
```

> **Note:** In SvelteKit, client-side environment variables must be prefixed with `VITE_` to be accessible via `import.meta.env`. You can configure this in your `vite.config.ts` or use `$env/static/public` / `$env/dynamic/public` from SvelteKit.

## Verify

1. Deploy your app or run it locally.
2. Visit a page on your SvelteKit app.
3. Check that the session appears in [app.highlight.io](https://app.highlight.io).
4. Trigger a server error (e.g., visit a broken API route) and verify the error shows up in Highlight with the correct session linked.

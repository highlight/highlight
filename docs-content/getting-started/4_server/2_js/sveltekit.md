---
title: SvelteKit
heading: SvelteKit Backend Instrumentation
slug: sveltekit
createdAt: 2026-05-29T00:00:00.000Z
updatedAt: 2026-05-29T00:00:00.000Z
---

## Overview

This guide covers instrumenting your SvelteKit server with Highlight for error monitoring and tracing. SvelteKit uses server hooks (`hooks.server.ts`) for request handling, which is where we'll integrate Highlight.

## Installation

```shell
# with npm
npm install @highlight-run/node

# with yarn
yarn add @highlight-run/node

# with pnpm
pnpm add @highlight-run/node
```

## Server Instrumentation

### 1. Initialize Highlight in your server hooks

Create or update your `src/hooks.server.ts` file to initialize Highlight on server startup:

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const projectID = process.env.HIGHLIGHT_PROJECT_ID

// Initialize Highlight
H.init({
	projectID: projectID ?? '',
	serviceName: 'my-sveltekit-app',
	environment: process.env.NODE_ENV || 'development',
})
```

### 2. Create a request handler to capture errors

Add a `handle` hook that wraps your request handler to capture errors and attach session/request IDs:

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const projectID = process.env.HIGHLIGHT_PROJECT_ID

H.init({
	projectID: projectID ?? '',
	serviceName: 'my-sveltekit-app',
})

export const handle: Handle = async ({ event, resolve }) => {
	// Extract Highlight headers from the request
	const highlightHeaders = H.parseHeaders(
		Object.fromEntries(event.request.headers),
	)

	// Store session and request IDs in locals for use in error handling
	if (highlightHeaders) {
		event.locals.highlightSessionId = highlightHeaders.secureSessionId
		event.locals.highlightRequestId = highlightHeaders.requestId
	}

	try {
		const response = await resolve(event)
		return response
	} catch (error) {
		// Capture the error with Highlight
		if (error instanceof Error) {
			H.consumeError(
				error,
				event.locals.highlightSessionId,
				event.locals.highlightRequestId,
			)
		}
		throw error
	}
}
```

### 3. Export a custom error handler

Use `handleError` to capture errors that occur during rendering:

```typescript
// src/hooks.server.ts
export const handleError: HandleServerError = async ({
	error,
	event,
	status,
	message,
}) => {
	// Capture the error with Highlight
	if (error instanceof Error) {
		H.consumeError(
			error,
			event.locals.highlightSessionId,
			event.locals.highlightRequestId,
		)
	} else {
		H.consumeError(
			new Error(`Unknown error: ${JSON.stringify(error)}`),
			event.locals.highlightSessionId,
			event.locals.highlightRequestId,
		)
	}

	// Return a custom error page or default message
	return {
		message: status === 404 ? 'Not Found' : 'Internal Error',
	}
}
```

## Complete Example

Here's the full `src/hooks.server.ts` file:

```typescript
// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const projectID = process.env.HIGHLIGHT_PROJECT_ID

H.init({
	projectID: projectID ?? '',
	serviceName: 'my-sveltekit-app',
	environment: process.env.NODE_ENV || 'development',
})

export const handle: Handle = async ({ event, resolve }) => {
	const highlightHeaders = H.parseHeaders(
		Object.fromEntries(event.request.headers),
	)

	if (highlightHeaders) {
		event.locals.highlightSessionId = highlightHeaders.secureSessionId
		event.locals.highlightRequestId = highlightHeaders.requestId
	}

	try {
		const response = await resolve(event)
		return response
	} catch (error) {
		if (error instanceof Error) {
			H.consumeError(
				error,
				event.locals.highlightSessionId,
				event.locals.highlightRequestId,
			)
		}
		throw error
	}
}

export const handleError: HandleServerError = async ({
	error,
	event,
	status,
	message,
}) => {
	if (error instanceof Error) {
		H.consumeError(
			error,
			event.locals.highlightSessionId,
			event.locals.highlightRequestId,
		)
	} else {
		H.consumeError(
			new Error(`Unknown error: ${JSON.stringify(error)}`),
			event.locals.highlightSessionId,
			event.locals.highlightRequestId,
		)
	}

	return {
		message: status === 404 ? 'Not Found' : 'Internal Error',
	}
}
```

## Type Definitions

Add Highlight types to your `app.d.ts`:

```typescript
// src/app.d.ts
declare global {
	namespace App {
		interface Locals {
			highlightSessionId?: string
			highlightRequestId?: string
		}
	}
}

export {}
```

## Environment Variables

Make sure to set your Highlight project ID:

```bash
# .env
HIGHLIGHT_PROJECT_ID=your_project_id_here
```

## Server-Side Error Capture in Load Functions

You can also manually capture errors in your SvelteKit load functions:

```typescript
// src/routes/+page.server.ts
import { H } from '@highlight-run/node'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// Your data fetching logic
		const data = await fetchData()
		return { data }
	} catch (error) {
		if (error instanceof Error) {
			H.consumeError(
				error,
				locals.highlightSessionId,
				locals.highlightRequestId,
			)
		}
		throw error
	}
}
```

## Combining with Browser Instrumentation

For full-stack monitoring, combine this with the [SvelteKit browser instrumentation](/docs/getting-started/browser/svelte-kit) to get session replays linked with server errors.

## Troubleshooting

### Errors not appearing

1. Verify your `HIGHLIGHT_PROJECT_ID` environment variable is set correctly.
2. Check that `H.init()` is called before any request handling.
3. Ensure your SvelteKit app is running in Node.js (not edge runtime).

### Session linking not working

Make sure the browser SDK is initialized with `tracingOrigins` configured to include your server domain. This ensures the Highlight session headers are sent with requests to your server.

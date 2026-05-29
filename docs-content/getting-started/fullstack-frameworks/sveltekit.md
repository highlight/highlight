---
title: SvelteKit Walkthrough
slug: sveltekit
heading: SvelteKit Walkthrough
createdAt: 2026-05-29T00:00:00.000Z
updatedAt: 2026-05-29T00:00:00.000Z
---

## Overview

Our SvelteKit integration gives you access to frontend session replays and server-side monitoring, all-in-one.

1. Use `<HighlightInit />` to track session replay and client-side errors.
1. Use `H.init` to instrument SvelteKit's server hooks.

## Installation

```shell
# with npm
npm install @highlight-run/node highlight.run

# with yarn
yarn add @highlight-run/node highlight.run

# with pnpm
pnpm add @highlight-run/node highlight.run
```

## Client Instrumentation

Add the Highlight snippet to your app's root layout. See [SvelteKit Browser Docs](/docs/getting-started/browser/svelte-kit) for detailed client setup.

## Server Instrumentation

### 1. Initialize Highlight in your server hooks

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
		message: 'Internal Error',
	}
}
```

### 2. Add type definitions

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

### 3. Set environment variables

```bash
# .env
HIGHLIGHT_PROJECT_ID=your_project_id_here
```

## Full Example

For a complete working example, see the [SvelteKit server instrumentation docs](/docs/getting-started/server/sveltekit).

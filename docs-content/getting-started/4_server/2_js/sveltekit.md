---
toc: SvelteKit
title: SvelteKit Backend Quick Start
heading: SvelteKit Backend Quick Start
metaTitle: SvelteKit Backend Quick Start
slug: sveltekit
createdAt: 2026-05-20T00:00:00.000Z
updatedAt: 2026-05-20T00:00:00.000Z
---

Use Highlight's Node.js SDK from SvelteKit server hooks to report backend
exceptions from `+server.ts`, load functions, form actions, and server-side
rendering. This backend setup complements the
[SvelteKit browser guide](../../3_browser/6_sveltekit.md), which records
sessions and sends the Highlight request headers used to connect frontend
sessions with backend errors.

## Install the backend SDK

\`\`\`bash
npm install @highlight-run/node
\`\`\`

## Configure server-only environment variables

Keep these values in server-only environment variables. In SvelteKit, values
read through `$env/dynamic/private` are never exposed to browser bundles.

\`\`\`bash
HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>
HIGHLIGHT_SERVICE_NAME=sveltekit-server
HIGHLIGHT_SERVICE_VERSION=<YOUR_COMMIT_SHA>
\`\`\`

## Initialize Highlight in `hooks.server.ts`

Initialize the SDK once in `src/hooks.server.ts`, then use SvelteKit's
`handleError` hook to report backend errors.

\`\`\`ts
// src/hooks.server.ts
import { env } from '$env/dynamic/private'
import type { HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

if (env.HIGHLIGHT_PROJECT_ID && !H.isInitialized()) {
	H.init({
		projectID: env.HIGHLIGHT_PROJECT_ID,
		serviceName: env.HIGHLIGHT_SERVICE_NAME || 'sveltekit-server',
		serviceVersion: env.HIGHLIGHT_SERVICE_VERSION,
	})
}

const headersToObject = (headers: Headers): Record<string, string> =>
	Object.fromEntries(headers.entries())

export const handleError: HandleServerError = ({ error, event }) => {
	if (error instanceof Error && H.isInitialized()) {
		const parsed = H.parseHeaders(headersToObject(event.request.headers))
		if (parsed) {
			H.consumeError(error, parsed.secureSessionId, parsed.requestId, {
				method: event.request.method,
				route: event.route.id ?? 'unknown',
				url: event.url.pathname,
			})
		}
	}
	return { message: 'Unexpected server error' }
}
\`\`\`

## Verify backend error reporting

\`\`\`ts
// src/routes/api/highlight-test/+server.ts
export const GET = () => {
	throw new Error('Highlight SvelteKit backend test error')
}
\`\`\`

Run the app and open `/api/highlight-test`. The error should appear in Highlight
with the `sveltekit-server` service name.

## Notes

- `hooks.server.ts` only runs on the server, so it is the right place to import
  `@highlight-run/node`.
- Backend errors can only be connected to a frontend session when the request
  contains Highlight's browser request header.
- Keep `HIGHLIGHT_PROJECT_ID` private. Do not import server environment values
  into client-side Svelte components or `+page.ts` files.

import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { jsGetSnippet } from './shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'

const svelteKitInitCode = `// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})`

const svelteKitHandleCode = `// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		event.request.headers,
		() => resolve(event),
	)
}`

const svelteKitErrorCode = `// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)
	H.consumeError(
		error instanceof Error ? error : new Error(String(error)),
		parsed?.secureSessionId,
		parsed?.requestId,
	)
}`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Set up highlight.io server-side error monitoring in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the SDK in hooks.server.ts.',
			content:
				'Import `@highlight-run/node` and call `H.init()` once in `src/hooks.server.ts`. ' +
				'Set `serviceName` so your SvelteKit server spans show up with a clear name in the Traces view. ' +
				'See [tracingOrigins](../2_frontend-backend-mapping.md) for how to connect server spans to frontend sessions.',
			code: [
				{
					text: svelteKitInitCode,
					language: 'ts',
				},
			],
		},
		{
			title: 'Wrap requests with H.runWithHeaders.',
			content:
				'Export a `handle` hook that wraps every request through `H.runWithHeaders(...)`. ' +
				'This creates a parent span for every server request and links it to the session ID from the browser. ' +
				'If you already have a `handle` function, wrap just the `resolve(event)` call.',
			code: [
				{
					text: svelteKitHandleCode,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report server errors.',
			content:
				'Export `handleError` to send uncaught exceptions to Highlight. ' +
				'`H.parseHeaders(...)` extracts the session and request IDs so the error is linked to the right browser session.',
			code: [
				{
					text: svelteKitErrorCode,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}

import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on the server side of your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the SDK and wrap requests in `src/hooks.server.ts`.',
			content:
				'SvelteKit executes every server request through the `handle` hook. ' +
				'Initialize the [Highlight Node.js SDK](https://www.highlight.io/docs/sdk/nodejs) at module load, then wrap `resolve` with `H.runWithHeaders` so each request gets a root span ' +
				'linked to the frontend session via the `x-highlight-request` header. ' +
				'Logs written with `console` methods during the request are attached to the active trace.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'
import { env } from '$env/dynamic/private'

if (!H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-app',
		environment: env.NODE_ENV ?? 'production',
	})
}

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		\`\${event.request.method} \${event.route.id ?? event.url.pathname}\`,
		event.request.headers,
		async (span) => {
			span.setAttribute('http.route', event.route.id ?? '')
			const response = await resolve(event)
			span.setAttribute('http.status_code', response.status)
			return response
		},
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report unexpected server errors with `handleError`.',
			content:
				'SvelteKit invokes `handleError` for unhandled exceptions in load functions, form actions, and API endpoints. ' +
				'Extract session and request identifiers using `H.parseHeaders`, forward the error to Highlight with `H.consumeError`, and flush pending telemetry before serverless workers freeze.',
			code: [
				{
					text: `// src/hooks.server.ts (continued)
export const handleError: HandleServerError = async ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		event.request.headers,
	)
	H.consumeError(
		error instanceof Error ? error : new Error(String(error)),
		secureSessionId,
		requestId,
		{ 'sveltekit.route': event.route.id ?? event.url.pathname },
	)
	await H.flush()

	return { message: 'Internal Server Error' }
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Connect client sessions to backend traces in `src/hooks.client.ts`.',
			content:
				'To correlate client sessions with server traces, initialize the [Highlight client SDK](https://www.highlight.io/docs/getting-started/browser/svelte-kit) with `tracingOrigins: true`. ' +
				'This automatically attaches the `x-highlight-request` header to outgoing `fetch` requests.',
			code: [
				{
					text: `// src/hooks.client.ts
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
	tracingOrigins: true,
	networkRecording: { enabled: true, recordHeadersAndBody: true },
})`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
export const GET = () => {
	throw new Error('Test SvelteKit backend error')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

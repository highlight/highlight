import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to instrument a SvelteKit server running in a Node.js runtime.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Instrument src/hooks.server.ts.',
			content:
				'Initialize the Node SDK once when the server module loads. The `handle` hook creates a request span and propagates the incoming trace and Highlight session context while SvelteKit resolves the request. Convert the web-standard `Headers` object to the plain header record accepted by the Node SDK. The separate `handleError` hook reports unexpected errors from server loads, actions, rendering, and endpoints. SvelteKit does not call `handleError` for expected errors created with its `error(...)` helper.',
			code: [
				{
					language: 'ts',
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building && !H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-server',
		serviceVersion: 'git-sha',
		environment: 'production',
	})
}

export const handle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event)
	}

	const spanName = \`\${event.request.method} \${
		event.route.id ?? event.url.pathname
	}\`
	const headers = Object.fromEntries(event.request.headers)

	return H.runWithHeaders(spanName, headers, () => resolve(event))
}

export const handleError: HandleServerError = async ({
	error,
	event,
	message,
}) => {
	if (H.isInitialized()) {
		const headers = Object.fromEntries(event.request.headers)
		const { secureSessionId, requestId } = H.parseHeaders(headers)
		const reportedError =
			error instanceof Error
				? error
				: new Error('A non-Error value was thrown by the SvelteKit server')

		H.consumeError(reportedError, secureSessionId, requestId)
	}

	// Return only SvelteKit's safe message to the client.
	return { message }
}`,
				},
			],
		},
		{
			title: 'Compose with existing server hooks.',
			content:
				"If your app already exports a `handle` hook, keep each concern separate and compose the handlers with SvelteKit's `sequence` helper. Put Highlight first so its context surrounds the rest of the request pipeline.",
			code: [
				{
					language: 'ts',
					text: `// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'

const withHighlight: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event)
	}

	const spanName = \`\${event.request.method} \${
		event.route.id ?? event.url.pathname
	}\`
	const headers = Object.fromEntries(event.request.headers)

	return H.runWithHeaders(spanName, headers, () => resolve(event))
}

export const handle = sequence(withHighlight, yourExistingHandle)`,
				},
			],
		},
		{
			title: 'Check your deployment runtime.',
			content:
				'`@highlight-run/node` requires a Node.js runtime, such as `adapter-node` or a provider adapter configured for Node.js. It is not compatible with edge runtimes; use the relevant edge integration, such as the [Cloudflare Workers quickstart](https://www.highlight.io/docs/getting-started/server/js/cloudflare), instead. Fully prerendered sites built with `adapter-static` have no production SvelteKit server to instrument. The `building` guard above also keeps prerendering out of production telemetry. On short-lived serverless functions, use `await H.consumeAndFlush(...)` instead of `H.consumeError(...)` when the runtime may exit before queued telemetry is sent.',
		},
		verifyError(
			'SvelteKit server',
			`// src/routes/api/highlight-test/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = () => {
	throw new Error('Highlight SvelteKit server test error')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

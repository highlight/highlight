import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import {
	frontendInstallSnippet,
	verifyErrors,
} from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io backend monitoring for your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize Highlight and wrap SvelteKit server requests.',
			content:
				'Use the SvelteKit `handle` hook to create a Highlight trace for each server-side request. Copy the incoming request headers before passing them to `H.runWithHeaders` so Highlight can read the `x-highlight-request` header without mutating SvelteKit request headers.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	const headers = new Headers(event.request.headers)

	return H.runWithHeaders('sveltekit.request', headers, async () => {
		return resolve(event)
	})
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Report unexpected server errors.',
			content:
				'SvelteKit calls `handleError` for unexpected server-side errors during request handling, loading, or rendering. Parse the Highlight request header from the original request and report the error so it can be connected to the related session and request.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = async ({
	error,
	event,
	status,
}) => {
	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)
	const highlightError =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(highlightError, secureSessionId, requestId, {
		route: event.route.id ?? 'unknown',
		status,
	})
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Add custom spans inside server handlers.',
			content:
				'After the `handle` hook is installed, spans created in server routes, actions, and server load functions are tied to the current request context.',
			code: [
				{
					text: `// src/routes/api/ping/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	const { span } = H.startWithHeaders('sveltekit.api.ping', {})

	try {
		console.info('checking API health')
		return new Response('ok')
	} finally {
		span.end()
	}
}`,
					language: 'js',
				},
			],
		},
		verifyErrors,
		verifyLogs,
		verifyTraces,
	],
}

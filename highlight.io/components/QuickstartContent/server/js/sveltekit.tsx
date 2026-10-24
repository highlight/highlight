import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io server instrumentation for your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Wrap SvelteKit server requests.',
			content:
				'Use the SvelteKit `handle` hook to run each server request inside `H.runWithHeaders`. Convert the SvelteKit `Headers` object into a plain object before passing it to the Node SDK.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})

const headersToObject = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		headersToObject(event.request.headers),
		async () => resolve(event),
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report server-side errors.',
			content:
				'When handling errors in SvelteKit, parse the request headers so server errors can be linked back to the frontend session and request.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

const headersToObject = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(headersToObject(event.request.headers))
	const normalizedError =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(normalizedError, parsed.secureSessionId, parsed.requestId)

	return {
		message: 'An unexpected error occurred.',
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/example/+server.ts
export const GET = async () => {
	throw new Error('example SvelteKit server error')
}`,
		),
		{
			title: 'Record server logs.',
			content:
				'Logs written with built-in console methods are automatically captured by the Highlight Node SDK. Pass structured metadata as the second argument when useful.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
export const GET = async () => {
	console.info('SvelteKit endpoint called', {
		route: '/api/example',
	})

	return new Response('ok')
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Create custom spans.',
			content:
				'After requests are wrapped with `H.runWithHeaders`, spans created with `H.startWithHeaders` are associated with the incoming request context.',
			code: [
				{
					text: `// src/routes/api/work/+server.ts
import { H } from '@highlight-run/node'

export const GET = async () => {
	const { span } = H.startWithHeaders('expensive-work', {})

	try {
		// Run the work you want to trace.
		return new Response('done')
	} finally {
		span.end()
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}

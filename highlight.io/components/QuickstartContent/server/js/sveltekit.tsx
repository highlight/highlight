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
	subtitle: 'Learn how to set up highlight.io in SvelteKit server hooks.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Wrap server requests in hooks.server.ts.',
			content:
				'Use SvelteKit server hooks to run each request with its incoming headers. ' +
				'This connects server spans, logs, and errors to the frontend session when the browser SDK sends tracing headers.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

const headersToObject = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(headersToObject(event.request.headers), () =>
		resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		headersToObject(event.request.headers),
	)

	H.consumeError(error as Error, secureSessionId, requestId)
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/highlight-error/+server.ts
export const GET = () => {
	throw new Error('highlight server error')
}`,
		),
		{
			title: 'Record backend logs from SvelteKit routes.',
			content:
				'Logs emitted inside server hooks, server routes, and load functions are captured by the initialized Node SDK.',
			code: [
				{
					text: `// src/routes/highlight-log/+server.ts
export const GET = () => {
	console.info('hello from a SvelteKit server route', {
		route: '/highlight-log',
	})

	return new Response('ok')
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}

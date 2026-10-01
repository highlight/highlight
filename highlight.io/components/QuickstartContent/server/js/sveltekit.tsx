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
	subtitle: 'Learn how to set up highlight.io in a SvelteKit server.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Initialize Highlight for server requests.',
			content:
				'Initialize the Node.js SDK from `hooks.server.ts`, then wrap each request with `H.runWithHeaders`. Convert SvelteKit `Headers` to a plain object before passing them to Highlight.',
			code: [
				{
					language: 'ts',
					text: `// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'sveltekit-server',
	environment: 'production',
})

const headersToObject = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(headersToObject(event.request.headers), async () => {
		return resolve(event)
	})
}`,
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

const headersToObject = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(headersToObject(event.request.headers))
	H.consumeError(error as Error, parsed.secureSessionId, parsed.requestId)

	return {
		message: 'An unexpected error occurred.',
	}
}`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs written during server requests are recorded by the Node.js SDK. Pass an object as the second argument to attach searchable fields.',
			code: [
				{
					language: 'ts',
					text: `// src/routes/api/example/+server.ts
export const GET = async () => {
	console.info('sveltekit server route called', {
		route: '/api/example',
	})

	return new Response('ok')
}`,
				},
			],
		},
		verifyLogs,
		{
			title: 'Create custom spans in server routes.',
			content:
				'Use `H.startWithHeaders` inside a server route or load function when you need an explicit span for a backend operation.',
			code: [
				{
					language: 'ts',
					text: `// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'

export const GET = async () => {
	const { span } = H.startWithHeaders('sveltekit-api-example', {})

	try {
		return new Response('ok')
	} finally {
		span.end()
	}
}`,
				},
			],
		},
		verifyTraces,
	],
}

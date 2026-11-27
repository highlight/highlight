import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSveltekitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io on the SvelteKit server.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: `Instrument SvelteKit's server hooks.`,
			content:
				'SvelteKit exposes `hooks.server.ts`, which runs for every server-side request. Initialize the Highlight SDK there, capture request context in the `handle` hook, and report server errors in the `handleError` hook so they are linked to the frontend session.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { building } from '$app/environment'

if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-app',
		environment: 'production',
	})
}

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event)
}

export const handleError: HandleServerError = async ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		event.request.headers,
	)
	H.consumeError(error as Error, secureSessionId, requestId)
}`,
					language: `ts`,
				},
			],
		},
		{
			title: `Report errors manually in server routes and load functions.`,
			content:
				'Errors you catch yourself inside `+page.server.ts`, `+server.ts`, or server `load` functions are not sent to `handleError`, so report them directly.',
			code: [
				{
					text: `// src/routes/api/data/+server.ts
import { H } from '@highlight-run/node'
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async (event) => {
	try {
		// do something dangerous...
		throw new Error('oh no!')
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(
			event.request.headers,
		)
		H.consumeError(error as Error, secureSessionId, requestId)
		return json({ error: 'internal error' }, { status: 500 })
	}
}`,
					language: `ts`,
				},
			],
		},
		verifyError(
			'sveltekit',
			`// src/routes/api/error/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	throw new Error('sample error!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

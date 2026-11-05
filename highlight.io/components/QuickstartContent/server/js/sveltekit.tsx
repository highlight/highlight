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
		'Learn how to set up highlight.io in a SvelteKit server (hooks.server.ts and server routes).',
	logoKey: 'svelte',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: `Initialize Highlight in hooks.server.ts.`,
			content:
				'In SvelteKit, initialize the Node SDK inside `src/hooks.server.ts` so it boots once per server process. The `handle` hook instruments every request.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H, Handlers } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const highlightConfig = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production'
}
H.init(highlightConfig)

// Convert SvelteKit Headers to a plain object for the SDK.
function headersToObject(headers: Headers): Record<string, string> {
	return Object.fromEntries(headers.entries())
}

export const handle: Handle = sequence(async ({ event, resolve }) => {
	try {
		return await resolve(event)
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(
			headersToObject(event.request.headers)
		)
		H.consumeError(error as Error, secureSessionId, requestId)
		throw error
	}
})

// Report unhandled server-side errors to Highlight.
export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		headersToObject(event.request.headers)
	)
	H.consumeError(error as Error, secureSessionId, requestId)
	return { message: 'Internal error', status }
}`,
					language: `ts`,
				},
			],
		},
		{
			title: `Instrument a server route (+server.ts).`,
			content:
				'For SvelteKit server routes (`+server.ts` / `+page.server.ts` load functions), wrap logic in a try/catch and call `H.consumeError`, passing the request headers so the error is linked to the trace.',
			code: [
				{
					text: `// src/routes/api/hello/+server.ts
import { H } from '@highlight-run/node'
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ request }) => {
	try {
		// do something dangerous...
		throw new Error('oh no! a server route error')
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(
			Object.fromEntries(request.headers.entries())
		)
		H.consumeError(error as Error, secureSessionId, requestId)
		return json({ error: 'failed' }, { status: 500 })
	}
}`,
					language: `ts`,
				},
			],
		},
		verifyError(
			'After a request throws in a `handle` hook, `handleError`, or a `+server.ts` route, open your Highlight dashboard to confirm the server error was reported with its trace context.'
		),
		verifyLogs('SvelteKit'),
		verifyTraces('SvelteKit'),
	],
}

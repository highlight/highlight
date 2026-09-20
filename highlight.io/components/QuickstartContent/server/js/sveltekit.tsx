import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the SvelteKit Highlight integration.',
			content:
				addIntegrationContent('Node Highlight SDK', 'nodejs') +
				' ' +
				'SvelteKit runs server code in `src/hooks.server.ts`. Wrap the `handle` hook in `H.runWithHeaders` so that every request is traced and linked to the frontend session, and report server-side errors from `handleError`. ' +
				'This requires a Node.js adapter (e.g. `@sveltejs/adapter-node`), since `@highlight-run/node` does not run on edge runtimes.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		event.request.headers,
		async () => resolve(event),
	)
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
			title: `Report errors from server routes and load functions.`,
			content:
				'Errors thrown in `+page.server.ts` load functions and `+server.ts` endpoints are forwarded to `handleError` and reported automatically. ' +
				'If you catch an error yourself, report it with `H.consumeError` using the session parsed from the request headers.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
	try {
		throw new Error('example error!')
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(
			event.request.headers,
		)
		H.consumeError(error as Error, secureSessionId, requestId)
		return new Response('reported!', { status: 500 })
	}
}`,
					language: `ts`,
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
export function GET() {
	throw new Error('example error!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

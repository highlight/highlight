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
		'Learn how to set up highlight.io server instrumentation in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add Highlight to your server hooks.',
			content:
				'Initialize `@highlight-run/node` from `src/hooks.server.ts`, then wrap each request with `H.runWithHeaders()` so server errors, logs, and traces can be correlated with the frontend session. Use a Node-compatible SvelteKit adapter for this setup; edge-only runtimes should use the runtime-specific server guide instead.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})

const headersToRecord = (headers: Headers): Record<string, string> =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(headersToRecord(event.request.headers), () =>
		resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(headersToRecord(event.request.headers))

	if (error instanceof Error) {
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
	} else {
		H.consumeError(
			new Error(String(error)),
			parsed?.secureSessionId,
			parsed?.requestId,
		)
	}

	console.error(error)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Trace a server route.',
			content:
				'For endpoint-specific spans, pass the SvelteKit request headers to `H.runWithHeaders()` inside the route handler before starting child spans or writing logs.',
			code: [
				{
					text: `// src/routes/api/highlight-check/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

const headersToRecord = (headers: Headers): Record<string, string> =>
	Object.fromEntries(headers.entries())

export const GET: RequestHandler = async ({ request }) => {
	return H.runWithHeaders(headersToRecord(request.headers), () => {
		const { span } = H.startWithHeaders('sveltekit-server-route', {})

		console.info('Sending a SvelteKit backend trace to Highlight')
		span.end()

		return json({ ok: true })
	})
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/highlight-error/+server.ts
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	throw new Error('Highlight SvelteKit backend test')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io on your SvelteKit backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Instrument SvelteKit server hooks (hooks.server.ts)',
			content:
				'In SvelteKit, use `src/hooks.server.ts` (or `src/hooks.server.js`) to initialize the `@highlight-run/node` SDK, propagate distributed trace contexts via `H.runWithHeaders`, and capture unhandled server errors inside `handleError`.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	return await H.runWithHeaders(headers, async () => {
		const { span } = H.startWithHeaders('sveltekit-request', headers)
		try {
			const response = await resolve(event)
			return response
		} finally {
			span.end()
		}
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const parsed = H.parseHeaders(headers)
	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	}
}`,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`// src/routes/api/test-error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('SvelteKit backend test error!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

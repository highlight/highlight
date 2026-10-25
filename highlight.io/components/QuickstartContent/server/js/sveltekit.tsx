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
	subtitle: 'Learn how to set up highlight.io for SvelteKit server backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add Highlight to SvelteKit server hooks.',
			content:
				'In SvelteKit, server hooks run on every request. You can initialize Highlight and wrap incoming requests using `H.runWithHeaders()` in `src/hooks.server.ts` (or `hooks.server.js`) to automatically correlate backend traces, logs, and errors with frontend sessions.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	return await H.runWithHeaders(headers, async () => {
		return await resolve(event)
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const { secureSessionId, requestId } = H.parseHeaders(headers)
	H.consumeError(error as Error, secureSessionId, requestId)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Trace and capture errors in server load functions.',
			content:
				'Inside SvelteKit server load functions (`+page.server.ts`) or form actions, you can manually trace operations or report errors using the Node SDK.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import { H } from '@highlight-run/node'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
	const headers = Object.fromEntries(request.headers.entries())
	return await H.runWithHeaders(headers, async () => {
		const { span } = H.startWithHeaders('load-data', headers)

		try {
			console.info('Fetching data on SvelteKit server...')
			span.end()
			return { message: 'Hello from SvelteKit backend!' }
		} catch (error) {
			const { secureSessionId, requestId } = H.parseHeaders(headers)
			H.consumeError(error as Error, secureSessionId, requestId)
			span.end()
			throw error
		}
	})
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/+page.server.ts
export const load = async () => {
  throw new Error('Test SvelteKit backend error!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

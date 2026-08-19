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
			title: 'Wrap SvelteKit server requests.',
			content:
				'Use the SvelteKit `handle` hook to wrap each server request with `H.runWithHeaders`. Convert SvelteKit request headers into a plain object before passing them to Highlight.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers.entries())

	return H.runWithHeaders('sveltekit.request', headers, () =>
		resolve(event),
	)
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Report errors from server routes.',
			content:
				'When you handle an error manually in a SvelteKit server route, parse the same plain header object so the error can be tied back to the matching Highlight session and request.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	try {
		throw new Error('example error!')
	} catch (error) {
		const headers = Object.fromEntries(request.headers.entries())
		const { secureSessionId, requestId } = H.parseHeaders(headers)

		H.consumeError(
			error as Error,
			secureSessionId,
			requestId,
		)
	}

	return new Response('ok')
}`,
					language: 'js',
				},
			],
		},
		verifyError('SvelteKit', `throw new Error('example error!')`),
		verifyLogs,
		verifyTraces,
	],
}

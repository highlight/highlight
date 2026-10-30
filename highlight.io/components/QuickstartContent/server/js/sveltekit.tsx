import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets-tracing'
import { verifyLogs } from '../shared-snippets-logging'
import { jsGetSnippet } from '../../backend/js/shared-snippets'
import { manualError, verifyError } from './shared-snippets-monitoring'

export const SvelteKitTracesReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io tracing for your SvelteKit application.',
	entries: [
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight SDK in hooks.server.ts',
			content:
				'In SvelteKit, server-side code runs in `hooks.server.ts`. Initialize the Highlight Node.js SDK there so that errors and traces are captured for all server-side requests.',
			code: [
				{
					text: `// src/hooks.server.ts
import { Handle, HandleError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init('<YOUR_PROJECT_ID>', {
	environment: 'production',
	version: 'commit:abcdefg12345',
})

export const handleError: HandleError = ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)
	H.consumeError(error, parsed.secureSessionId, parsed.requestId)
}

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event)
	return response
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Instrument your API routes (+server.ts)',
			content:
				'SvelteKit API routes live in `+server.ts` files. Wrap your handlers to create traces and capture errors.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	const { span } = H.startWithHeaders('sveltekit-api-span', {})

	console.info('Here: /api/example ⌚⌚⌚')

	const data = { message: 'Hello from SvelteKit!' }
	span.end()

	return json(data)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Instrument server-side load functions (+page.server.ts)',
			content:
				'SvelteKit `load` functions in `+page.server.ts` run on the server. You can wrap them to create traces and capture errors.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'
import { H } from '@highlight-run/node'

export const load: PageServerLoad = async ({ request }) => {
	const { span } = H.startWithHeaders('sveltekit-load-span', {})

	console.info('Here: +page.server.ts load ⌚⌚⌚')

	const data = { title: 'Hello from SvelteKit!' }
	span.end()

	return data
}`,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`try {
	throw new Error('example error!')
} catch (e) {
	H.consumeError(e)
}

`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `console.log('hey there!');
console.warn('whoa there', { key: 'value' });`,
					language: 'js',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}

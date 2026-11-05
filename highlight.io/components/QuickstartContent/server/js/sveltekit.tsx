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
		'Learn how to set up highlight.io in your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the SvelteKit server hooks.',
			content:
				'SvelteKit runs server-side code through [hooks](https://svelte.dev/docs/kit/hooks) defined in `src/hooks.server.ts`. ' +
				'Add the `H.init()` call from the previous step to the top of that file, then wrap the `handle` hook with `H.runWithHeaders` so every request is traced and tied to the browser session, ' +
				'and report unexpected errors from `handleError` with `H.consumeError`. ' +
				'If you already have hooks of your own, compose them with the [`sequence`](https://svelte.dev/docs/kit/hooks#sequence) helper instead of replacing them.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

// H.init(...) from the previous step goes here, at the top of the file,
// so the SDK is ready before the first request is handled.

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers)
	return H.runWithHeaders(headers, async () => {
		const { span } = H.startWithHeaders('sveltekit.handle', headers)
		try {
			return await resolve(event)
		} finally {
			span.end()
		}
	})
}

export const handleError: HandleServerError = async ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)
	H.consumeError(
		error as Error,
		parsed?.secureSessionId,
		parsed?.requestId,
	)

	console.error(error)
	return { message: 'Whoops!' }
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	throw new Error('example error!')
}`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `// src/routes/+page.server.ts
export const load = async () => {
	console.log('hey there!')
	console.warn('whoa there', { key: 'value' })
	return {}
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Wrap your endpoints using the Node.js SDK.',
			content:
				'By calling `H.startWithHeaders()` and `span.end()`, the `@highlight-run/node` SDK will record a span for your endpoints and server load functions. You can create more child spans or add custom attributes to each span.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('example-endpoint', headers)

	console.info('Here: /api/example ⌚⌚⌚')

	span.end()
	return new Response('Success: /api/example')
}`,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}

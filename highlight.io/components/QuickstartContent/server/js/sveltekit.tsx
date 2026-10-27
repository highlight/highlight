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
	subtitle: 'Learn how to set up highlight.io in your SvelteKit backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Configure the SvelteKit server hooks.',
			content:
				'In `src/hooks.server.ts`, wrap requests with `H.runWithHeaders` in the `handle` hook and report uncaught server errors with `H.consumeError` in the [`handleError`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror) hook. Use `Object.fromEntries(event.request.headers)` to convert SvelteKit Fetch `Headers` into a header record.',
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
	const headers = Object.fromEntries(event.request.headers)
	return H.runWithHeaders(headers, () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(\`Unknown server error: \${JSON.stringify(error)}\`),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('example sveltekit server error!')
}`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the Highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	console.log('Loading page data in SvelteKit')
	console.warn('Slow query warning', { route: '/', durationMs: 420 })
	return {}
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Wrap your code using the Node.js SDK.',
			content:
				'By calling `H.startWithHeaders()` and `span.end()`, the `@highlight-run/node` SDK will record a span. Because the `handle` hook wraps requests in `H.runWithHeaders()`, spans created in server routes or `load` functions automatically inherit the request context.',
			code: [
				{
					text: `// src/routes/api/trace/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('sveltekit-api-trace', headers)

	console.info('Handling traced SvelteKit endpoint')
	span.end()

	return json({ ok: true })
}`,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}

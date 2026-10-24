import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on your SvelteKit server backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight Node.js SDK in hooks.server.ts.',
			content:
				'In SvelteKit, initialize `@highlight-run/node` in `src/hooks.server.ts` (or `src/hooks.server.js`). Convert the Fetch `Headers` instance on `event.request.headers` into a plain object using `Object.fromEntries(event.request.headers)` before passing it to `H.runWithHeaders` and `H.parseHeaders` so distributed traces, logs, and errors are correlated with your frontend session.',
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
			new Error(String(error)),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}`,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`// src/routes/api/error-test/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('example SvelteKit server error!')
}`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the Highlight SDK during server-side rendering, `load` functions, form actions, and server endpoints. Structured key-value objects passed to console methods can be searched in Highlight.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	console.info('Loading SvelteKit page', { pathname: url.pathname })
	return {}
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Create custom spans in server routes or load functions.',
			content:
				'Because `handle` in `src/hooks.server.ts` already wraps each request with `H.runWithHeaders`, you can call `H.startWithHeaders` inside any server route or `load` function to record custom spans tied to the current session and request trace.',
			code: [
				{
					text: `// src/routes/api/checkout/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const POST: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = await H.startWithHeaders('checkout-handler', headers, {
		route: '/api/checkout',
	})

	try {
		console.info('Processing checkout request')
		return json({ ok: true })
	} finally {
		span.end()
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}
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
		'Learn how to set up highlight.io server-side instrumentation in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Wrap SvelteKit server requests in src/hooks.server.ts.',
			content:
				'Use the SvelteKit `handle` hook to wrap incoming requests with `H.runWithHeaders`. Converting `event.request.headers` with `Object.fromEntries` extracts the `x-highlight-request` header (`secureSessionId` and `requestId`) so backend traces, logs, and errors are automatically linked to the frontend session replay.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle } from '@sveltejs/kit'

const highlightOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	serviceVersion: 'git-sha',
	environment: 'production',
}

if (!H.isInitialized()) {
	H.init(highlightOptions)
}

const headersToRecord = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	const headers = headersToRecord(event.request.headers)

	return await H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		headers,
		async () => {
			return await resolve(event)
		},
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Capture unhandled server errors with handleError.',
			content:
				'Export the SvelteKit `handleError` hook in `src/hooks.server.ts` to capture unexpected exceptions thrown inside server `load` functions, form actions, and `+server.ts` endpoints, and forward them to `H.consumeError`.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

const headersToRecord = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const parsed = H.parseHeaders(headersToRecord(event.request.headers))
	const err =
		error instanceof Error
			? error
			: new Error(\`Unexpected SvelteKit error: \${JSON.stringify(error)}\`)

	H.consumeError(err, parsed?.secureSessionId, parsed?.requestId, {
		status,
		routeId: event.route.id ?? 'unknown',
		url: event.url.pathname,
	})

	return {
		message,
	}
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Trace server load functions, form actions, and API routes.',
			content:
				'Use `H.startWithHeaders` inside `+page.server.ts` load functions, form actions, or `+server.ts` endpoints to create custom OpenTelemetry spans and manually report caught errors.',
			code: [
				{
					text: `// src/routes/checkout/+page.server.ts
import { H } from '@highlight-run/node'
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request, params }) => {
	const headers = Object.fromEntries(request.headers.entries())
	const { span } = H.startWithHeaders('checkout.load', headers)

	try {
		console.info('Loading checkout data', { CartId: params.id })
		return { ready: true }
	} finally {
		span.end()
	}
}

export const actions: Actions = {
	default: async ({ request }) => {
		const headers = Object.fromEntries(request.headers.entries())
		const parsed = H.parseHeaders(headers)
		const { span } = H.startWithHeaders('checkout.submit', headers)

		try {
			// Perform checkout mutation
			return { success: true }
		} catch (err) {
			if (err instanceof Error) {
				H.consumeError(err, parsed?.secureSessionId, parsed?.requestId)
			}
			return fail(500, { error: 'Checkout failed' })
		} finally {
			span.end()
		}
	},
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
	throw new Error('example SvelteKit server error!')
}`,
		),
		{
			title: 'Call built-in console methods for server logging.',
			content:
				'With `@highlight-run/node` initialized, server-side `console.log`, `console.info`, `console.warn`, and `console.error` calls are automatically recorded and correlated with the active request span.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
	console.info('Handled SvelteKit API request', {
		pathname: url.pathname,
	})
	return json({ ok: true })
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}

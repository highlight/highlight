import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

const initServerSnippet = `// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})`

const handleHookSnippet = `// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	// SvelteKit passes a Headers object, but H.runWithHeaders expects
	// a plain record. Convert it before passing to the SDK.
	const headers: Record<string, string> = {}
	event.request.headers.forEach((value, key) => {
		headers[key] = value
	})

	return H.runWithHeaders(headers, async () => {
		const response = await resolve(event)
		return response
	})
}`

const handleErrorSnippet = `// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

export const handleError: HandleServerError = async ({ error, event }) => {
	// Convert SvelteKit Headers to a plain object for the SDK
	const headers: Record<string, string> = {}
	event.request.headers.forEach((value, key) => {
		headers[key] = value
	})

	const parsed = H.parseHeaders(headers)
	H.consumeError(error as Error, parsed.secureSessionId, parsed.requestId)

	return {
		message: 'Internal error',
	}
}`

const apiRouteSnippet = `// src/routes/api/example/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	const headers: Record<string, string> = {}
	request.headers.forEach((value, key) => {
		headers[key] = value
	})

	return H.runWithHeaders(headers, async () => {
		const { span } = H.startWithHeaders('api-call', {})
		// your logic here
		span.end()
		return json({ success: true })
	})
}`

const serverLoadSnippet = `// src/routes/data/+page.server.ts
import type { PageServerLoad } from './$types'
import { H } from '@highlight-run/node'

export const load: PageServerLoad = async ({ request }) => {
	const headers: Record<string, string> = {}
	request.headers.forEach((value, key) => {
		headers[key] = value
	})

	return H.runWithHeaders(headers, async () => {
		// If this throws, SvelteKit will route it through handleError
		const data = await fetchData()
		return { data }
	})
}`

const consoleSnippet = `// anywhere in your server code
console.log('user signed in', { userId: 123 })
console.warn('slow query detected', { duration: 1200 })
console.error('payment failed', { orderId: 'abc-123' })`

const manualErrorSnippet = `import { H } from '@highlight-run/node'

function handleRequest(request: Request) {
	const headers: Record<string, string> = {}
	request.headers.forEach((value, key) => {
		headers[key] = value
	})
	const parsed = H.parseHeaders(headers)
	H.consumeError(new Error('something went wrong'), parsed.secureSessionId, parsed.requestId)
}`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize Highlight in your server hooks.',
			content:
				'Create (or update) `src/hooks.server.ts` and call `H.init()` at the top. ' +
				'This sets up error capture, logging, and tracing for every request on the server.',
			code: [
				{
					text: initServerSnippet,
					language: 'js',
				},
			],
		},
		{
			title: 'Wrap requests with `H.runWithHeaders`.',
			content:
				'SvelteKit uses a `handle` hook that runs on every request. ' +
				'Wrap your `resolve` call with `H.runWithHeaders` so that Highlight can ' +
				'connect frontend sessions to backend traces and errors. ' +
				'\n\n' +
				'Note that SvelteKit gives you a `Headers` object, but the SDK expects ' +
				'a plain key-value record. The example below converts it automatically.',
			code: [
				{
					text: handleHookSnippet,
					language: 'js',
				},
			],
		},
		{
			title: 'Capture server errors with `handleError`.',
			content:
				'SvelteKit has a built-in `handleError` hook that fires whenever an ' +
				'unhandled exception occurs on the server. Use it to report errors ' +
				'to Highlight and keep them tied to the originating session.',
			code: [
				{
					text: handleErrorSnippet,
					language: 'js',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/test-error/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	throw new Error('This is a test error from SvelteKit!')
}`,
		),
		{
			title: 'Instrument API routes.',
			content:
				'For `+server.ts` API endpoints, wrap your handler logic with `H.runWithHeaders' +
				'` the same way. This gives you traces and error correlation for API calls.',
			code: [
				{
					text: apiRouteSnippet,
					language: 'js',
				},
			],
		},
		{
			title: 'Instrument server load functions.',
			content:
				'Server-side `load` functions run on the server and can throw errors. ' +
				'Wrap them with `H.runWithHeaders` so errors are captured and ' +
				'correlated to the right session.',
			code: [
				{
					text: serverLoadSnippet,
					language: 'js',
				},
			],
		},
		{
			title: 'Logs are captured automatically.',
			content:
				'Once `H.init()` is called, `console.log`, `console.warn`, and ' +
				'`console.error` calls on the server are sent to Highlight. ' +
				'Pass structured data as the second argument for searchable key-value logs.',
			code: [
				{
					text: consoleSnippet,
					language: 'js',
				},
			],
		},
		verifyLogs,
		{
			title: 'Create custom spans.',
			content:
				'Wrap any server-side logic with `H.startWithHeaders` to record a trace span. ' +
				'Child spans inherit the parent context automatically.',
			code: [
				{
					text: `import { H } from '@highlight-run/node'

async function processOrder(orderId: string) {
	const { span } = H.startWithHeaders('processOrder', {}, { orderId })
	// your business logic
	await chargePayment(orderId)
	span.end()
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Report errors manually.',
			content:
				'If you catch an error yourself and still want to send it to Highlight, ' +
				'use `H.parseHeaders` and `H.consumeError`.',
			code: [
				{
					text: manualErrorSnippet,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}

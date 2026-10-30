import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to instrument SvelteKit server hooks with highlight.io.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Node SDK in hooks.server.ts.',
			content:
				'Create `src/hooks.server.ts` and initialize the [Node SDK](' +
				siteUrl('/docs/sdk/nodejs') +
				') once when the server starts. Keep this in server-only code, and set `serviceName` and `environment` so traces are easy to identify.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Wrap server requests with the handle hook.',
			content:
				'Export a `handle` hook so every server request runs inside `H.runWithHeaders`. Pass a plain object of headers, not `event.request.headers`: SvelteKit request headers are immutable, and `runWithHeaders` writes trace propagation headers to the object it receives. `runWithHeaders` creates a span named by its first argument, reads the `x-highlight-request` header that pairs the request with a frontend session, and ends the span after `resolve` finishes. On SvelteKit 3, import `Handle` from `@sveltejs/kit/hooks` instead of `@sveltejs/kit`.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers)

	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		headers,
		() => resolve(event),
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report unexpected server errors.',
			content:
				'Export a `handleError` hook to report errors that SvelteKit catches while loading a route. Parse the same request headers, normalize the unknown error value, and use `H.consumeAndFlush` so the exception is recorded and exported before a serverless invocation ends. In SvelteKit 2, expected errors created with `error(...)` do not reach this hook. In SvelteKit 3, import `HandleServerError` from `@sveltejs/kit/hooks` and return early unless the error kind is `unknown`, because the hook also receives app and framework errors.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = async ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const { secureSessionId, requestId } = H.parseHeaders(headers)
	const exception = error instanceof Error ? error : new Error(String(error))

	await H.consumeAndFlush(exception, secureSessionId, requestId)

	return { message: 'An unexpected error occurred.' }
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
export const GET = () => {
	throw new Error('example SvelteKit server error')
}`,
		),
		verifyLogs,
		{
			title: 'Add custom spans to server routes.',
			content:
				'Use `H.startWithHeaders` inside a route handler to add a child span to the request trace. The active trace context from the `handle` hook is inherited, and the `x-highlight-request` header attaches the span to the same frontend session. Forward only that header: passing an incoming `traceparent` again would re-parent the span and break the request hierarchy. End the span in a `finally` block.',
			code: [
				{
					text: `// src/routes/api/report/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	const { span } = H.startWithHeaders('load-report', {
		'x-highlight-request':
			request.headers.get('x-highlight-request') ?? '',
	})

	try {
		// Do the work you want to trace here.
		return new Response('ok')
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

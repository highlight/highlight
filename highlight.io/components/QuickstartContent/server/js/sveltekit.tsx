import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io in your SvelteKit server hooks.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Use a Node.js runtime for server-side instrumentation.',
			content:
				'`@highlight-run/node` uses the Node.js OpenTelemetry SDK, so it must run in SvelteKit server code that uses a Node.js runtime. It is not compatible with edge-only runtimes. If you deploy with an edge adapter, keep the instrumentation in Node.js serverless functions or use the OpenTelemetry HTTP exporter directly.',
		},
		{
			title: 'Initialize and wrap requests in `hooks.server.ts`.',
			content:
				"Initialize `@highlight-run/node` once when the server module loads, then wrap SvelteKit's `handle` hook with `H.runWithHeaders`. Convert the web `Headers` object to a plain object so Highlight can read and propagate the `x-highlight-request` correlation header.",
			code: [
				{
					text: `// src/hooks.server.ts
import { env } from '$env/dynamic/private'
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: env.HIGHLIGHT_PROJECT_ID ?? '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: env.HIGHLIGHT_SERVICE_VERSION,
	environment: env.NODE_ENV ?? 'development',
})

const requestHeaders = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		requestHeaders(event.request.headers),
		() => resolve(event),
		{
			attributes: {
				'http.request.method': event.request.method,
				'http.route': event.route.id ?? event.url.pathname,
			},
		},
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report unhandled server errors with `handleError`.',
			content:
				'SvelteKit invokes `handleError` for unexpected server-side errors. Parse the incoming Highlight headers and consume the error so it is associated with the correct frontend session and request trace. Flushing is useful in serverless deployments where the process may freeze or exit after the response.',
			code: [
				{
					text: `export const handleError: HandleServerError = async ({
	error,
	event,
}) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		requestHeaders(event.request.headers),
	)
	const exception = error instanceof Error ? error : new Error(String(error))

	await H.consumeAndFlush(exception, secureSessionId, requestId, {
		'http.request.method': event.request.method,
		'http.route': event.route.id ?? event.url.pathname,
	})

	return {
		message: 'An unexpected server error occurred.',
	}
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Correlate frontend and backend telemetry.',
			content:
				'In the browser SDK, keep `tracingOrigins` and `networkRecording` enabled as shown in the SvelteKit client quickstart. For same-origin SvelteKit server routes, the browser SDK can then send `x-highlight-request` automatically. If your SvelteKit server is called cross-origin, allow that header in your CORS configuration.',
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/test-error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = () => {
	throw new Error('Example SvelteKit server error!')
}`,
		),
		setupLogging('sveltekit'),
		verifyLogs,
		verifyTraces,
	],
}

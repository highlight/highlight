import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

const hooksServerSnippet = `// src/hooks.server.ts
import { building } from '$app/environment'
import { env } from '$env/dynamic/private'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const projectID = env.HIGHLIGHT_PROJECT_ID

if (!building) {
	if (!projectID) {
		throw new Error('HIGHLIGHT_PROJECT_ID is required')
	}

	if (!H.isInitialized()) {
		H.init({
			projectID,
			serviceName: env.HIGHLIGHT_SERVICE_NAME ?? 'my-sveltekit-app',
			serviceVersion: env.HIGHLIGHT_SERVICE_VERSION,
			environment: env.HIGHLIGHT_ENVIRONMENT ?? 'production',
		})
	}
}

// SvelteKit uses Web Headers. A plain record lets the Node SDK and
// OpenTelemetry read x-highlight-request and W3C trace headers reliably.
const toHighlightHeaders = (headers: Headers): Record<string, string> =>
	Object.fromEntries(headers.entries())

const withHighlight: Handle = async ({ event, resolve }) => {
	if (building || !H.isInitialized()) {
		return resolve(event)
	}

	const headers = toHighlightHeaders(event.request.headers)
	const route = event.route.id ?? 'unknown'

	const response = await H.runWithHeaders(
		\`\${event.request.method} \${route}\`,
		headers,
		() => resolve(event),
	)

	// Flush after runWithHeaders closes the request span. This also delivers
	// errors queued by handleError before a short-lived Node function freezes.
	if (response.status >= 500) {
		await H.flush()
	}

	return response
}

export const handle = withHighlight

export const handleError: HandleServerError = ({
	error,
	event,
	status,
	message,
}) => {
	if (building || !H.isInitialized()) {
		return { message }
	}

	const { secureSessionId, requestId } = H.parseHeaders(
		event.request.headers,
	)
	const reportedError =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(reportedError, secureSessionId, requestId, {
		'http.request.method': event.request.method,
		'http.route': event.route.id ?? 'unknown',
		'http.response.status_code': status,
	})

	// Keep SvelteKit's safe public message instead of exposing the exception.
	return { message }
}`

const sequenceSnippet = `// If hooks.server.ts already exports another Handle, compose it instead of
// replacing it. Keep withHighlight first so its context wraps later hooks.
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(withHighlight, existingHandle)`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to capture SvelteKit server errors, logs, and traces with highlight.io.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Configure private server environment variables.',
			content:
				'Add your Highlight project ID to the private environment used by the SvelteKit server. ' +
				'`HIGHLIGHT_SERVICE_NAME`, `HIGHLIGHT_SERVICE_VERSION`, and `HIGHLIGHT_ENVIRONMENT` are optional but make deployments easier to distinguish.',
			code: [
				{
					text: `HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>
HIGHLIGHT_SERVICE_NAME=my-sveltekit-app
HIGHLIGHT_SERVICE_VERSION=git-sha
HIGHLIGHT_ENVIRONMENT=production`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Instrument requests and report server errors.',
			content:
				'Initialize `@highlight-run/node` once at module scope in `src/hooks.server.ts`. ' +
				'Wrap `resolve(event)` with `H.runWithHeaders(name, headers, callback)` so request logs and child spans share the incoming trace and Highlight session context. ' +
				'SvelteKit provides a Web `Headers` object. Convert it to a fresh plain record before `H.runWithHeaders` so OpenTelemetry can extract and inject the enumerable `traceparent`, `tracestate`, `baggage`, and `x-highlight-request` carrier fields. `H.parseHeaders` can read Web `Headers` directly.\n\n' +
				"SvelteKit turns unexpected errors from server load functions and endpoints into responses, so a `try/catch` around `resolve` is not sufficient. Queue those exceptions synchronously from `handleError`; after `resolve` returns a 5xx response, `handle` flushes the error and completed request span before a short-lived Node runtime can freeze. Expected errors created with SvelteKit's `error(...)` helper do not invoke `handleError` and must be reported manually if you want to capture them.\n\n" +
				'The `building` guard prevents SDK initialization and telemetry while SvelteKit prerenders routes during the build.',
			code: [
				{
					text: hooksServerSnippet,
					language: 'ts',
				},
			],
		},
		{
			title: 'Compose Highlight with existing server hooks. (optional)',
			content:
				"If your app already exports a `handle` hook, use SvelteKit's `sequence` helper rather than replacing it. " +
				'Put `withHighlight` first so authentication, routing, and endpoint work runs inside the Highlight context.',
			code: [
				{
					text: sequenceSnippet,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit server',
			`// src/routes/api/highlight-test/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = () => {
	console.info('Highlight captured this SvelteKit server request')
	throw new Error('Highlight SvelteKit server test')
}`,
		),
		verifyLogs,
		verifyTraces,
		{
			title: 'Troubleshoot missing or unlinked telemetry.',
			content:
				'`@highlight-run/node` requires a Node-compatible SvelteKit adapter or serverless Node runtime; it does not run in Cloudflare Workers or other edge runtimes. A fully static adapter has no request-time server process, so only dynamic SSR routes and endpoints can produce server telemetry.\n\n' +
				"If server telemetry arrives without a linked browser session, confirm the browser SDK's `tracingOrigins` includes the SvelteKit server origin and that proxies or cross-origin CORS rules preserve the `x-highlight-request` header. " +
				'For an edge deployment, use the Cloudflare or native OpenTelemetry server setup instead. If you catch an error and return a successful response, call `H.consumeAndFlush` manually because the 5xx flush path will not run.',
		},
	],
}

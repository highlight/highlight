import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'
import { siteUrl } from '../../../../utils/urls'

/**
 * SvelteKit Node server instrumentation (#8032).
 *
 * Uses `@highlight-run/node` from `hooks.server.ts`. Unlike Express, there is
 * no framework middleware: wrap `resolve` with `H.runWithHeaders` and pass a
 * plain header map (Fetch `Headers` is not a safe OTEL carrier).
 */
export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Instrument a SvelteKit Node server (hooks.server.ts) with highlight.io.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		{
			title: 'Use a Node.js adapter.',
			content:
				'`@highlight-run/node` requires a Node runtime. Prefer [@sveltejs/adapter-node](https://svelte.dev/docs/kit/adapter-node) (or another Node adapter). Keep Highlight imports in server-only modules (`hooks.server.ts`, `+server.ts`, `+page.server.ts`). Edge/static adapters are out of scope here.',
		},
		jsGetSnippet(['node']),
		{
			title: 'Initialize once in `src/hooks.server.ts`.',
			content:
				'Skip init while SvelteKit is prerendering (`building === true`). Use the same project ID as the [browser SvelteKit quickstart](' +
				siteUrl('/docs/getting-started/browser/svelte-kit') +
				') so server spans can join the session. Project ID: [app.highlight.io/setup](https://app.highlight.io/setup).',
			code: [
				{
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'

if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'sveltekit-server',
		serviceVersion: 'git-sha',
		environment: 'production',
	})
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Pass a plain object header carrier.',
			content:
				'`H.runWithHeaders` / OpenTelemetry extract+inject expect a plain mutable map. A Fetch `Headers` instance is not interchangeable with Node `IncomingHttpHeaders`. Always copy: `Object.fromEntries(request.headers)`.',
			code: [
				{
					text: `function highlightHeaders(request: Request): Record<string, string> {
	return Object.fromEntries(request.headers)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Wrap `handle` with `H.runWithHeaders`.',
			content:
				addIntegrationContent('Node Highlight SDK', 'nodejs') +
				' Name the span with method + route id. Set HTTP attributes after `resolve`. If you already have hooks, compose with [`sequence`](https://svelte.dev/docs/kit/@sveltejs-kit-hooks#sequence) and keep Highlight outermost. Enable `tracingOrigins: true` on the browser SDK so the Highlight request header is sent.',
			code: [
				{
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'sveltekit-server',
		serviceVersion: 'git-sha',
		environment: 'production',
	})
}

function highlightHeaders(request: Request): Record<string, string> {
	return Object.fromEntries(request.headers)
}

export const handle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event)
	}

	const route = event.route.id ?? event.url.pathname
	return H.runWithHeaders(
		\`\${event.request.method} \${route}\`,
		highlightHeaders(event.request),
		async (span) => {
			const response = await resolve(event)
			span.setAttribute('http.request.method', event.request.method)
			span.setAttribute('http.route', route)
			span.setAttribute('http.response.status_code', response.status)
			return response
		},
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report unexpected errors in `handleError`.',
			content:
				'SvelteKit invokes `handleError` for unexpected failures in loads/endpoints/rendering. Parse session context from headers, then report with `H.consumeError` on a dedicated error span. Call `H.startWithHeaders(\'sveltekit.error\', {})` with an empty carrier so the error span stays a child of the active request span — passing the raw request headers would re-extract an incoming `traceparent` and attach the error as a sibling of the request. Return SvelteKit\'s safe `message` to the client — never the raw exception string.',
			code: [
				{
					text: `export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	if (!building) {
		const headers = highlightHeaders(event.request)
		const { secureSessionId, requestId } = H.parseHeaders(headers)
		const { span } = H.startWithHeaders('sveltekit.error', {})
		H.consumeError(error as Error, secureSessionId, requestId, undefined, {
			span,
		})
	}
	return { message }
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/error/+server.ts
export function GET() {
	throw new Error('sample SvelteKit server error')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

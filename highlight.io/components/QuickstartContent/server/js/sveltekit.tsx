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

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to instrument a SvelteKit Node server with highlight.io.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		{
			title: 'Deploy on a Node-compatible adapter.',
			content:
				'`@highlight-run/node` needs a Node.js runtime. Use [@sveltejs/adapter-node](https://svelte.dev/docs/kit/adapter-node) or another Node adapter. Keep Highlight imports in server-only files (`hooks.server.ts`, `+server.ts`, `+page.server.ts`). Edge adapters (Cloudflare, Vercel Edge) and static-only builds are out of scope for this SDK.',
		},
		jsGetSnippet(['node']),
		{
			title: 'Initialize Highlight once in `src/hooks.server.ts`.',
			content:
				'Skip init while SvelteKit is prerendering (`building` is true). Use the same project ID as your browser SDK so server errors and traces can join the session. Grab the ID from [app.highlight.io/setup](https://app.highlight.io/setup).',
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
			title: 'Pass a plain header carrier into the SDK.',
			content:
				'This is the SvelteKit-specific gotcha. OpenTelemetry extract/inject (used inside `H.runWithHeaders` and `H.startWithHeaders`) read and write carriers with plain property access. A Fetch `Headers` object does not behave like a Node `IncomingHttpHeaders` map, and inject also needs a mutable carrier. Copy request headers into a plain object before you call the SDK. `H.parseHeaders` can read a `Headers` instance for the Highlight session header, but the plain copy is still the right habit so W3C `traceparent` and session context stay in sync.',
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
			title: 'Wrap every request with `H.runWithHeaders`.',
			content:
				addIntegrationContent('Node Highlight SDK', 'nodejs') +
				' Export a `handle` hook that wraps `resolve(event)`. Name the span with method + route id so traces stay readable. Set the HTTP status on the span after `resolve` returns. If you already have hooks (auth, locale, etc.), compose with SvelteKit [`sequence`](https://svelte.dev/docs/kit/@sveltejs-kit-hooks#sequence) and keep Highlight as the outer wrapper so child work stays inside the request span. Pair this with `tracingOrigins: true` (and network recording) on the [browser SvelteKit quickstart](' +
				siteUrl('/docs/getting-started/browser/svelte-kit') +
				') so the client sends the Highlight request header.',
			code: [
				{
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'
// Optional: import { sequence } from '@sveltejs/kit/hooks'

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
}

// If you already export handle for auth or i18n:
// export const handle = sequence(highlightHandle, authHandle)`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report unexpected errors from `handleError`.',
			content:
				"SvelteKit calls `handleError` for unexpected failures in endpoints, server loads, and rendering. Expected `error(...)` responses and `redirect(...)` do not go through this hook the same way. Parse session context from the request headers, then call `H.consumeError`. Always return SvelteKit's safe `message` for the client, not the raw exception text.",
			code: [
				{
					text: `export const handleError: HandleServerError = ({
	error,
	event,
	status,
	message,
}) => {
	if (!building) {
		const { secureSessionId, requestId } = H.parseHeaders(
			highlightHeaders(event.request),
		)
		H.consumeError(
			error instanceof Error ? error : new Error(String(error)),
			secureSessionId,
			requestId,
			{
				'http.request.method': event.request.method,
				'http.route': event.route.id ?? event.url.pathname,
				'http.response.status_code': status,
			},
		)
	}

	return { message }
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report caught errors in routes and load functions.',
			content:
				'Uncaught errors still reach `handleError`. When you catch inside `+server.ts` or `+page.server.ts`, report yourself with `H.consumeError` so the failure is not silent.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	try {
		throw new Error('example API failure')
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(
			Object.fromEntries(request.headers),
		)
		H.consumeError(error as Error, secureSessionId, requestId)
		return json({ ok: false }, { status: 500 })
	}
}

// src/routes/+page.server.ts
import { H } from '@highlight-run/node'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
	try {
		return { ok: true }
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(
			Object.fromEntries(request.headers),
		)
		H.consumeError(error as Error, secureSessionId, requestId)
		throw error
	}
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Add a child span for slow server work.',
			content:
				'Inside a request already wrapped by `H.runWithHeaders`, start a child span with `H.startWithHeaders`, do the work, then call `span.end()`. Pass the same plain header carrier (or `{}` to inherit active context).',
			code: [
				{
					text: `import { H } from '@highlight-run/node'

export async function loadCatalog(request: Request) {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('loadCatalog', headers)
	try {
		// ... database or upstream call
		return { items: [] }
	} finally {
		span.end()
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/highlight-test/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => {
	if (url.searchParams.has('error')) {
		throw new Error('SvelteKit backend test error')
	}
	console.info('highlight sveltekit backend ok')
	return json({ ok: true })
}`,
		),
		{
			title: 'Console logs are captured after init.',
			content:
				'After `H.init`, `console` methods are recorded automatically. Prefer logging inside `H.runWithHeaders` so logs inherit the request and session context. You can also call `H.log(message, level, secureSessionId, requestId)` when you already parsed headers.',
		},
		verifyLogs,
		verifyTraces,
		{
			title: 'Troubleshoot common gaps.',
			content:
				'No session link: confirm the browser SDK sets `tracingOrigins: true` and uses the same project ID. Empty traces on prerender: skip `H.init` / `handle` work when `building` is true. Errors missing: check you are on adapter-node (or another Node server), not an edge adapter. Trace context dropped: pass `Object.fromEntries(request.headers)` into `H.runWithHeaders`, not the raw `Headers` instance. Remove any temporary `/api/highlight-test` route before shipping.',
		},
	],
}

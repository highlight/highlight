import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io server instrumentation in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		{
			title: 'Use a Node-compatible adapter.',
			content:
				'`@highlight-run/node` requires a Node.js runtime. Deploy with `@sveltejs/adapter-node` (or another Node adapter). Edge adapters such as Cloudflare or Vercel Edge are not supported by the Node SDK.',
		},
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Instrument `src/hooks.server.ts`.',
			content:
				addIntegrationContent('Node Highlight SDK', 'nodejs') +
				' Initialize Highlight once (skip during prerender/`building`), wrap every request with `H.runWithHeaders`, and report unexpected errors from `handleError`. ' +
				'Copy request headers into a plain object before calling `H.runWithHeaders` / `H.parseHeaders` so OpenTelemetry can inject context (SvelteKit `Headers` instances are not safely mutable). ' +
				'Pair this with `tracingOrigins: true` on the browser SDK so session/request headers flow from the client.',
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
			span.setAttribute('http.response.status_code', response.status)
			span.setAttribute('http.route', route)
			return response
		},
	)
}

export const handleError: HandleServerError = ({ error, event, message }) => {
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
			},
		)
	}

	// Keep SvelteKit's safe client-facing message.
	return { message }
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report errors from API routes and load functions.',
			content:
				'Uncaught errors in `+server.ts` handlers and `+page.server.ts` load functions are forwarded to `handleError`. If you catch an error yourself, report it with `H.consumeError` using session context from the request headers.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	try {
		// dangerous work...
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
		verifyError(
			'SvelteKit',
			`// src/routes/api/highlight-test/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => {
	if (url.searchParams.has('error')) {
		throw new Error('SvelteKit backend test error')
	}
	return json({ ok: true })
}`,
		),
		verifyLogs,
		verifyTraces,
		{
			title: 'Optional: emit a custom span.',
			content:
				'Inside a request wrapped by `H.runWithHeaders`, start child spans with `H.startWithHeaders` for important server work.',
			code: [
				{
					text: `import { H } from '@highlight-run/node'

export const GET = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('load-user', headers)
	try {
		// ...
		return new Response('ok')
	} finally {
		span.end()
	}
}`,
					language: 'ts',
				},
			],
		},
	],
}

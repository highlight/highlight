import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

// Reorganized JS server quickstart for SvelteKit backend hooks and route handlers.
export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit server.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight Node.js SDK in hooks.server.ts.',
			content:
				'In SvelteKit, server-side requests and uncaught exceptions pass through `src/hooks.server.ts` (or `src/hooks.server.js`). Initialize `@highlight-run/node` and export `handle` and `handleError` hooks. Convert `event.request.headers` with `Object.fromEntries(event.request.headers)` before passing headers to `H.runWithHeaders` or `H.parseHeaders` so incoming `x-highlight-request` and OpenTelemetry trace headers are propagated as a plain header record.',
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

	return await H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		headers,
		() => resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(\`Unhandled server error: \${JSON.stringify(error)}\`),
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
			`// src/routes/api/error/+server.ts
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const parsed = H.parseHeaders(headers)

	try {
		throw new Error('example sveltekit server error!')
	} catch (error) {
		H.consumeError(
			error as Error,
			parsed.secureSessionId,
			parsed.requestId,
		)
		throw error
	}
}`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the Highlight SDK inside server `load` functions, form actions, and `+server.ts` routes. Additional key-value metadata passed as a second dictionary argument is indexed for structured log search.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	console.info('Loading SvelteKit page data', {
		pathname: url.pathname,
	})

	return {
		visitedAt: new Date().toISOString(),
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Wrap server code using the Node.js SDK.',
			content:
				'By calling `H.runWithHeaders()` or `H.startWithHeaders()` and `span.end()` with `Object.fromEntries(request.headers)`, `@highlight-run/node` creates spans linked to the active frontend session and trace context.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'
import { H } from '@highlight-run/node'

export const load: PageServerLoad = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('load-page-data', headers)

	try {
		return {
			status: 'ok',
		}
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

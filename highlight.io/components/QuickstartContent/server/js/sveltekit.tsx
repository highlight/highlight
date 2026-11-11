import { siteUrl } from '../../../utils/urls'
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
		'Learn how to set up highlight.io on your SvelteKit Node.js backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the @highlight-run/node SDK in hooks.server.ts.',
			content:
				'In SvelteKit applications running on a Node-compatible adapter (such as `@sveltejs/adapter-node`), initialize `@highlight-run/node` inside `src/hooks.server.ts`. Convert `event.request.headers` (`Headers`) into a plain `Record<string, string>` object via `Object.fromEntries(event.request.headers.entries())` before passing headers to `H.runWithHeaders` or `H.parseHeaders` so distributed trace and session context is preserved.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H, type NodeOptions } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightConfig: NodeOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	serviceVersion: 'git-sha',
	environment: 'production',
}

H.init(highlightConfig)

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers.entries())

	return await H.runWithHeaders(headers, async () => {
		return await resolve(event)
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(typeof error === 'string' ? error : JSON.stringify(error)),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}
`,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers.entries())
	const parsed = H.parseHeaders(headers)
	const error = new Error('example SvelteKit server error!')

	H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	throw error
}
`,
		),
		{
			title: 'Call built-in console methods in server routes and load functions.',
			content:
				'Server-side logs inside `+server.ts` endpoints and `+page.server.ts` load functions are automatically recorded by the Highlight Node SDK and correlated with the active session.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	console.info('Loading SvelteKit page data', { routeParams: params })
	return { ok: true }
}
`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Record custom spans in SvelteKit server handlers.',
			content:
				'Call `H.startWithHeaders()` and `span.end()` inside your SvelteKit server endpoints or load functions to emit custom OpenTelemetry spans.',
			code: [
				{
					text: `// src/routes/api/trace/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers.entries())
	const { span } = H.startWithHeaders('sveltekit-api-trace', headers, {
		route: '/api/trace',
	})

	try {
		return json({ traced: true })
	} finally {
		span.end()
	}
}
`,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}

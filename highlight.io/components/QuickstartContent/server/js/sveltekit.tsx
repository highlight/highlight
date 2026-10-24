import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on your SvelteKit server backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Instrument SvelteKit server hooks (`src/hooks.server.ts`).',
			content:
				'Use SvelteKit server hooks (`handle` and `handleError`) in `src/hooks.server.ts` (or `src/hooks.server.js`) to initialize `@highlight-run/node`, propagate distributed trace headers with `H.runWithHeaders`, and capture uncaught server exceptions with `H.consumeError`.',
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

	return H.runWithHeaders(headers, async () => {
		const { span } = H.startWithHeaders(
			\`\${event.request.method} \${event.url.pathname}\`,
			headers,
		)
		try {
			return await resolve(event)
		} finally {
			span.end()
		}
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(String(error)),
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

export const GET: RequestHandler = async () => {
	throw new Error('example SvelteKit server error!')
}`,
		),
		{
			title: 'Call built-in console methods in server routes.',
			content:
				'Logs in `+page.server.ts` load functions, form actions, and `+server.ts` API endpoints are automatically recorded by `@highlight-run/node` and correlated with the active request trace.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	console.info('Loading SvelteKit page data', { route: '/' })
	return { ok: true }
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}

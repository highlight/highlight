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
		'Learn how to set up highlight.io on your SvelteKit server backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Configure Vite SSR externalization.',
			content:
				'Because `@highlight-run/node` relies on OpenTelemetry Node.js instrumentations, mark `@highlight-run/node` as external in `vite.config.ts` so Vite does not bundle it during SSR.',
			code: [
				{
					text: `// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		external: ['@highlight-run/node'],
	},
})`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Add the Highlight server hooks in `src/hooks.server.ts`.',
			content:
				'Initialize `H.init` in `src/hooks.server.ts`, wrap incoming requests with `H.runWithHeaders` inside the `handle` hook to propagate session and trace headers, and capture uncaught server exceptions in `handleError` using `H.parseHeaders` and `H.consumeError`.',
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
		`${event.request.method} ${event.url.pathname}`,
		headers,
		async () => {
			return await resolve(event)
		},
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(`Unhandled server error: ${JSON.stringify(error)}`),
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
	throw new Error('Example SvelteKit server error!')
}`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Server-side `console.log`, `console.info`, `console.warn`, and `console.error` calls inside `+page.server.ts`, `+server.ts`, and `hooks.server.ts` are automatically recorded and correlated with the active request trace.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	console.info('Loading SvelteKit page data', { pathname: url.pathname })
	return { ok: true }
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Create custom spans in server load functions and actions.',
			content:
				'Use `H.startWithHeaders()` and `span.end()` inside `+page.server.ts` load functions or form actions to trace database queries or downstream API calls.',
			code: [
				{
					text: `// src/routes/orders/+page.server.ts
import type { PageServerLoad } from './$types'
import { H } from '@highlight-run/node'

export const load: PageServerLoad = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('fetch-user-orders', headers)

	try {
		// Perform database query or external fetch
		return { orders: [] }
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

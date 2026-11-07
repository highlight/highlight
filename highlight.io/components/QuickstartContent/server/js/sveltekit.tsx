import { siteUrl } from '../../../../utils/urls'
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
	subtitle: 'Learn how to set up highlight.io in your SvelteKit backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Configure SvelteKit server hooks.',
			content: `In \`src/hooks.server.ts\` (or \`src/hooks.server.js\`), initialize \`@highlight-run/node\`, wrap incoming requests with \`H.runWithHeaders\` in the [\`handle\`](https://kit.svelte.dev/docs/hooks#server-hooks-handle) hook to propagate trace context, and report uncaught exceptions in [\`handleError\`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror). See the [Node.js SDK docs](${siteUrl(
				'/docs/sdk/nodejs',
			)}) for configuration options.`,
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

	return await H.runWithHeaders(headers, async () => {
		return await resolve(event)
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(\`Unhandled SvelteKit server error: \${JSON.stringify(error)}\`),
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
			`// src/routes/api/test-error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('Example SvelteKit server error!')
}`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the Highlight SDK inside `handle`, server `load` functions, form actions, and `+server.ts` routes.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	console.info('Loading page data in SvelteKit server')
	return { ok: true }
}`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Create custom spans in server routes and load functions.',
			content:
				'By calling `H.startWithHeaders()` and `span.end()`, the `@highlight-run/node` SDK records custom spans correlated with the incoming SvelteKit request.',
			code: [
				{
					text: `// src/routes/api/items/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('fetch-items-span', headers)

	try {
		return json({ items: [] })
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

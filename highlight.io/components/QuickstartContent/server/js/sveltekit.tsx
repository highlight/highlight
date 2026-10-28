import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

const svelteKitHooksServerSnippet = `// src/hooks.server.ts
import { building } from '$app/environment'
import { H, type NodeOptions } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightOptions: NodeOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
}

if (!building) {
	H.init(highlightOptions)
}

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers)

	return await H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
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
			new Error(\`Unhandled SvelteKit server error: \${JSON.stringify(error)}\`),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}`

const svelteKitVerifyErrorSnippet = `// src/routes/api/error-test/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	console.info('Triggering test error in SvelteKit server route')
	throw new Error('SvelteKit backend verification error!')
}`

const svelteKitCustomSpanSnippet = `// src/routes/orders/+page.server.ts
import { H } from '@highlight-run/node'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const { span } = H.startWithHeaders('load-orders-query', headers)

	try {
		console.info('Fetching orders from database')
		return { orders: [] }
	} finally {
		span.end()
	}
}`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit (Server)',
	subtitle:
		'Learn how to set up highlight.io on your SvelteKit Node.js backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight Node.js SDK in `src/hooks.server.ts`.',
			content:
				`In SvelteKit, server-side request lifecycle hooks live in \`src/hooks.server.ts\`. ` +
				`Initialize the [Highlight Node.js SDK](${siteUrl('/docs/sdk/nodejs')}) outside of build time using \`!building\`, wrap incoming requests with \`H.runWithHeaders\` in \`handle\`, and capture uncaught exceptions in \`handleError\`. ` +
				`Convert \`event.request.headers\` to a plain object via \`Object.fromEntries(event.request.headers)\` so OpenTelemetry header propagation can read and inject trace context cleanly.`,
			code: [
				{
					text: svelteKitHooksServerSnippet,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError('SvelteKit', svelteKitVerifyErrorSnippet),
		verifyLogs,
		{
			title: 'Create custom spans in server load functions or API routes.',
			content:
				'Inside `+page.server.ts` load/action functions or `+server.ts` endpoints, call `H.startWithHeaders()` and `span.end()` to record custom child spans correlated with the active frontend session.',
			code: [
				{
					text: svelteKitCustomSpanSnippet,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}

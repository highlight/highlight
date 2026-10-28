import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io for the server side of your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		{
			title: 'Ensure your SvelteKit app uses a Node.js adapter.',
			content:
				'`@highlight-run/node` requires a Node.js runtime. Ensure your project is configured with [@sveltejs/adapter-node](https://svelte.dev/docs/kit/adapter-node) (or another Node-compatible adapter). Edge and serverless runtimes (such as Cloudflare Workers) require their respective SDK.',
		},
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight Node SDK in src/hooks.server.ts.',
			content:
				'SvelteKit handles server-side request execution through `src/hooks.server.ts`. Initialize the [Highlight Node SDK](/docs/sdk/nodejs) here. Guard initialization with `!building` to prevent Highlight from initializing during prerendering or build time.',
			code: [
				{
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'

if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-app',
		environment: 'production',
	})
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Trace incoming requests with the SvelteKit handle hook.',
			content:
				addIntegrationContent('Node Highlight SDK', 'nodejs') +
				' Wrap your request handling in SvelteKit’s `handle` hook using `H.runWithHeaders`. SvelteKit represents request headers as a Web Fetch `Headers` object; convert it to a plain object carrier using `Object.fromEntries(event.request.headers.entries())` for OpenTelemetry context propagation. This correlates server-side traces and logs with your client-side sessions.',
			code: [
				{
					text: `// src/hooks.server.ts (continued)
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event)
	}

	const headers = Object.fromEntries(event.request.headers.entries())

	return H.runWithHeaders(
		\`\${event.request.method} \${event.route.id ?? event.url.pathname}\`,
		headers,
		async (span) => {
			const response = await resolve(event)
			span.setAttribute('http.status_code', response.status)
			return response
		},
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report unhandled errors with the SvelteKit handleError hook.',
			content:
				'SvelteKit invokes `handleError` whenever an unexpected error is thrown during server execution (load functions, form actions, or endpoints). Parse incoming headers with `H.parseHeaders` to extract `secureSessionId` and `requestId`, and report the error with `H.consumeError`.',
			code: [
				{
					text: `// src/hooks.server.ts (continued)
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const { secureSessionId, requestId } = H.parseHeaders(headers)

	H.consumeError(
		error instanceof Error ? error : new Error(String(error)),
		secureSessionId,
		requestId,
	)

	return {
		message: 'An unexpected error occurred.',
	}
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report handled errors manually in server routes.',
			content:
				'If you catch an error in a `+server.ts` API route or `+page.server.ts` load function and return a custom response, use `H.parseHeaders` and `H.consumeError` to report it directly to Highlight without crashing the request.',
			code: [
				{
					text: `// src/routes/api/checkout/+server.ts
import { json } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

export async function POST({ request }) {
	try {
		// Business logic that could throw
		throw new Error('Payment processing failed')
	} catch (error) {
		const headers = Object.fromEntries(request.headers.entries())
		const { secureSessionId, requestId } = H.parseHeaders(headers)

		H.consumeError(error as Error, secureSessionId, requestId)

		return json({ error: 'Checkout failed' }, { status: 500 })
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/test-error/+server.ts
export async function GET() {
	throw new Error('Test server error from SvelteKit!')
}`,
		),
		{
			title: 'Capture server logs.',
			content:
				'With `@highlight-run/node` initialized, logs from built-in `console` methods (`console.log`, `console.info`, `console.error`) on the server are automatically captured and linked to active request traces.',
		},
		verifyLogs,
		verifyTraces,
	],
}

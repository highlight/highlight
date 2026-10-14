import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io for the server side of your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight JS SDK.',
			content:
				'SvelteKit runs all server-side code through `src/hooks.server.ts`, so initialize the [Highlight JS SDK](/docs/sdk/nodejs) there. This instruments every server route and form action.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production',
})`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Capture errors with the SvelteKit handleError hook.',
			content:
				'SvelteKit invokes `handleError` whenever a server route, load function, or form action throws. Reporting there means unhandled server errors land in Highlight automatically, correlated to the frontend session when `tracingOrigins` is enabled.',
			code: [
				{
					text: `// src/hooks.server.ts (continued)
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)
	H.consumeError(error as Error, secureSessionId, requestId)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Trace requests with the SvelteKit handle hook.',
			content:
				'Wrap `resolve` in `handle` to create a trace span per request. `H.startWithHeaders` picks up the highlight trace headers that the browser SDK sends.',
			code: [
				{
					text: `// src/hooks.server.ts (continued)
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	const { span } = H.startWithHeaders(
		event.route.id ?? event.url.pathname,
		Object.fromEntries(event.request.headers),
	)
	try {
		return await resolve(event)
	} finally {
		span.end()
	}
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report errors manually from endpoints.',
			content:
				'Inside `+server.ts` routes or server `load` functions, call `H.consumeError` in your own try/catch to report expected failures without letting them bubble to `handleError`.',
			code: [
				{
					text: `// src/routes/api/checkout/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	try {
		// do something dangerous...
		throw new Error('oh no! something failed')
	} catch (error) {
		const { secureSessionId, requestId } = H.parseHeaders(request.headers)
		H.consumeError(error as Error, secureSessionId, requestId)
		return json({ ok: false }, { status: 500 })
	}
	return json({ ok: true })
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'sveltekit',
			`// src/routes/api/oops/+server.ts
export async function GET() {
	throw new Error('sample error from sveltekit')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

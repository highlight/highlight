import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

const hooksServerSnippet = `// src/hooks.server.ts
import { env } from '$env/dynamic/private'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const projectID = env.HIGHLIGHT_PROJECT_ID

if (!projectID) {
	throw new Error('HIGHLIGHT_PROJECT_ID is required')
}

H.init({
	projectID,
	serviceName: env.HIGHLIGHT_SERVICE_NAME ?? 'sveltekit',
	environment: env.HIGHLIGHT_ENVIRONMENT ?? 'production',
})

const headersToObject = (headers: Headers): Record<string, string> =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	const headers = headersToObject(event.request.headers)

	return H.runWithHeaders(headers, () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = headersToObject(event.request.headers)
	const { secureSessionId, requestId } = H.parseHeaders(headers)
	const reportedError =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(reportedError, secureSessionId, requestId)

	return {
		message: 'Internal server error',
	}
}
`

const routeSnippet = `// src/routes/api/highlight-test/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	const { span } = H.startWithHeaders('sveltekit.server.route', {})

	try {
		console.info('Highlight captured this server log from SvelteKit')
		return new Response('ok')
	} finally {
		span.end()
	}
}
`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io backend instrumentation in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Add private Highlight environment variables.',
			content:
				'Configure your SvelteKit server runtime with `HIGHLIGHT_PROJECT_ID`. ' +
				'You can also set `HIGHLIGHT_SERVICE_NAME` and `HIGHLIGHT_ENVIRONMENT` to control how backend telemetry is grouped in Highlight.',
			code: [
				{
					text: `HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>
HIGHLIGHT_SERVICE_NAME=sveltekit
HIGHLIGHT_ENVIRONMENT=production`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Initialize Highlight in the SvelteKit server hook.',
			content:
				'Use `src/hooks.server.ts` so every server request is wrapped before it reaches your load functions or endpoint handlers. ' +
				'SvelteKit exposes request headers as a Web `Headers` object, so convert them to a plain object before calling `H.runWithHeaders` or `H.parseHeaders`.',
			code: [
				{
					text: hooksServerSnippet,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/highlight-error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('Highlight SvelteKit server test')
}
`,
		),
		{
			title: 'Verify server logs and traces.',
			content:
				'Call a SvelteKit endpoint that logs and creates a span. The request is already wrapped by `hooks.server.ts`, so logs and child spans are linked to the incoming Highlight headers.',
			code: [
				{
					text: routeSnippet,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		verifyTraces,
		{
			title: 'Confirm your adapter runs on Node.js.',
			content:
				'The `@highlight-run/node` SDK must run in a Node-compatible SvelteKit adapter. If a route is deployed to an edge runtime, use the Cloudflare or OpenTelemetry setup for that edge target instead.',
		},
	],
}

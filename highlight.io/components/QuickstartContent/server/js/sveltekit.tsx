import { jsGetSnippet, verifyError } from '../../backend/js/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { verifyTraces } from '../shared-snippets-tracing'

const svelteKitHeadersHelper = `const toHeadersObject = (headers: Headers): Record<string, string> =>
\tObject.fromEntries(headers.entries())`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io backend instrumentation for your SvelteKit app.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		jsGetSnippet(['node']),
		{
			title: 'Initialize Highlight in `src/hooks.server.ts`.',
			content:
				'Initialize `@highlight-run/node` in your SvelteKit server hook. This ensures backend errors, logs, and traces are captured from server requests.',
			code: [
				{
					language: 'ts',
					text: `import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
\tprojectID: '<YOUR_PROJECT_ID>',
\tserviceName: 'sveltekit-backend',
\tenvironment: 'production',
})

${svelteKitHeadersHelper}

export const handle: Handle = async ({ event, resolve }) => {
\treturn H.runWithHeaders(toHeadersObject(event.request.headers), async () => {
\t\treturn resolve(event)
\t})
}

export const handleError: HandleServerError = ({ error, event }) => {
\tconst parsed = H.parseHeaders(toHeadersObject(event.request.headers))
\tH.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
}`,
				},
			],
		},
		{
			title: 'Capture custom spans in server routes.',
			content:
				'Use `H.startWithHeaders` inside route handlers to add custom spans correlated to the incoming request.',
			code: [
				{
					language: 'ts',
					text: `// src/routes/api/demo/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'

export const GET = async ({ request }) => {
\tconst headers = Object.fromEntries(request.headers.entries())
\tconst { span } = H.startWithHeaders('sveltekit-demo-route', headers)

\tconsole.info('SvelteKit backend route reached')
\tspan.setAttribute('route', '/api/demo')
\tspan.end()

\treturn json({ ok: true })
}`,
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// throw in a backend route to confirm error capture
throw new Error('Highlight SvelteKit backend test error')`,
		),
		verifyLogs,
		verifyTraces,
	],
}

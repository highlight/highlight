import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Add Highlight to your SvelteKit server hooks.',
			content:
				'There is no dedicated `@highlight-run/sveltekit` package, so SvelteKit uses the generic `@highlight-run/node` SDK. ' +
				'Call `H.init()` once at module scope in `src/hooks.server.ts` so the SDK is ready before any request is served, then export SvelteKit\'s `handleError` hook. ' +
				'`handleError` is the hook that actually needs to run to report page, load and endpoint errors: `resolve()` converts those errors into a response internally rather than re-throwing them, ' +
				'so wrapping `resolve(event)` in a try/catch inside a `handle` hook will not see them. ' +
				'`H.parseHeaders()` takes the request `Headers` directly and returns the `secureSessionId` and `requestId` that map the error back onto the browser session. ' +
				'Note that `@highlight-run/node` targets Node.js runtimes only — if you deploy to an edge runtime such as Cloudflare Workers or Vercel Edge, use `@highlight-run/cloudflare` instead.',
			code: [
				{
					text: `import { H, type NodeOptions } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

const highlightConfig: NodeOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production',
}

H.init(highlightConfig)

export const handleError: HandleServerError = async ({ error, event, message }) => {
	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)

	await H.consumeAndFlush(error instanceof Error ? error : new Error(String(error)), secureSessionId, requestId, {
		url: event.request.url,
	})

	return { message }
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Optionally, report errors manually from an endpoint.',
			content:
				'Wrap the body of a `+server.ts` endpoint in a try/catch when you want to report the error yourself and still control the response your client receives. ' +
				'`H.consumeAndFlush()` awaits delivery before returning, which matters on short-lived Node platforms (AWS Lambda, Vercel and Netlify Node functions) where the process can be frozen as soon as a response is sent.',
			code: [
				{
					text: `// src/routes/api/example/+server.ts
import { json } from '@sveltejs/kit'
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)

	try {
		// do something dangerous...
		throw new Error('oh no!')
	} catch (error) {
		await H.consumeAndFlush(error as Error, secureSessionId, requestId)

		return json({ error: 'Internal Server Error' }, { status: 500 })
	}
}`,
					language: 'js',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/sample-error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('sample error!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

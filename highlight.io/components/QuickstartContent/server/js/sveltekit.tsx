import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

const svelteKitServerInitSnippet = `// hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})`

const svelteKitHandleErrorSnippet = `// hooks.server.ts
import type { HandleError } from '@sveltejs/kit'

export const handleError = (({ error, event }) => {
	H.consumeError(error as Error)
}) satisfies HandleError`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight JS SDK in your server hooks.',
			content:
				'SvelteKit runs server-side logic in `hooks.server.js` or `hooks.server.ts`. ' +
				'Initialize the [Highlight JS SDK](https://www.npmjs.com/package/@highlight-run/node) ' +
				'at the top of this file so that it instruments every server request. Grab your ' +
				'project ID from [app.highlight.io/setup](https://app.highlight.io/setup).',
			code: [
				{
					text: svelteKitServerInitSnippet,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report errors with the handleError hook.',
			content:
				'Export a `handleError` function from `hooks.server.ts` and forward any thrown ' +
				'errors to Highlight with `H.consumeError`. This catches errors raised inside ' +
				'your `+server.ts` endpoints, form actions, and load functions.',
			code: [
				{
					text: svelteKitHandleErrorSnippet,
					language: 'ts',
				},
			],
		},
		{
			title: 'Optionally, report manual errors in your app.',
			content:
				'If you need to report exceptions outside of the `handleError` hook, use ' +
				'`H.consumeError` directly. If your frontend is also instrumented, pair the ' +
				'error with the session using `H.parseHeaders` on the incoming request headers.',
			code: [
				{
					text: `const parsed = H.parseHeaders(request.headers)
H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/example/+server.ts
export const GET = async () => {
	throw new Error('example error!')
}`,
		),
		{
			title: 'Hit an endpoint and view the error in Highlight.',
			content:
				'Request one of your `+server.ts` endpoints (or trigger a form action / load ' +
				'function that throws) and make sure the error shows up in ' +
				'[Highlight](https://app.highlight.io/errors). Because `H.init` runs in your ' +
				'server hooks, `console.log`, `console.warn`, and `console.error` calls from ' +
				'server code are also captured automatically.',
		},
		verifyLogs,
		verifyTraces,
	],
}

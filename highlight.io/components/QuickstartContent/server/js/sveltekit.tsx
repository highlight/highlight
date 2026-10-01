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

export const SvelteKitServerContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io backend instrumentation for your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the Highlight handle hook to your SvelteKit server.',
			content:
				'In SvelteKit, the `handle` function in `hooks.server.ts` runs for every request. ' +
				'Wrap your handler with `H.runWithHeaders` to automatically associate backend errors, logs, and traces with frontend sessions.',
			code: [
				{
					text: \`// hooks.server.ts
import { H } from '@highlight-run/node'

export const handle = async ({ event, resolve }) => {
	return await H.runWithHeaders(
		event.request.headers,
		async (span) => {
			const response = await resolve(event)
			span.end()
			return response
		},
	)
}\`,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			\`// hooks.server.ts
import { H } from '@highlight-run/node'

export const handleError = async ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)
	H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
}\`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the Highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: \`// In any server route or module
console.log('Request received');
console.warn('Something unexpected', { 'key': 'value' });\`,
					language: 'ts',
				},
			],
		},
		verifyLogs,
		{
			title: 'Wrap your code using the Node.js SDK.',
			content:
				'By calling \`H.startWithHeaders()\` and \`span.end()\`, the \`@highlight-run/node\` SDK will record a span. ' +
				'You can create more child spans or add custom attributes to each span.',
			code: [
				{
					text: \`// In a server route (e.g., +server.ts)
import { H } from '@highlight-run/node'

export async function GET({ request }) {
	return await H.runWithHeaders(request.headers, async (span) => {
		const { span: innerSpan } = H.startWithHeaders('database-query', {})

		// Your database call or business logic here
		const data = await fetchData()

		innerSpan.end()
		span.end()

		return new Response(JSON.stringify(data), {
			headers: { 'Content-Type': 'application/json' },
		})
	})
}\`,
					language: 'ts',
				},
			],
		},
		verifyTraces,
	],
}

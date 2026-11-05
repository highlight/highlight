import { jsGetSnippet } from '../../backend/js/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets-tracing'

export const SvelteKitServerContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io backend instrumentation for your SvelteKit application.',
	entries: [
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight backend SDK in hooks.server.ts',
			content:
				'SvelteKit server-side hooks (`src/hooks.server.ts`) run for every request, making them the ideal place to initialize the Highlight Node SDK and wrap request handling.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { HandleServerError, Handle } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	environment: 'production',
	version: 'commit:abcdefg12345',
})

export const handleError: HandleServerError = async ({ error, event }) => {
	const parsed = H.parseHeaders(Object.entries(event.request.headers))

	H.consumeError(error as Error, parsed.secureSessionId, parsed.requestId)

	return error as Error
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Wrap your +server.ts endpoints with tracing',
			content:
				'Use `H.runWithHeaders` (or `H.startWithHeaders`) inside your SvelteKit API route handlers to create spans that pair with the frontend session via the `x-highlight-request` header.',
			code: [
				{
					text: `// src/routes/api/trace/+server.ts
import type { RequestHandler } from './$types'
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	return H.runWithHeaders('sveltekit-api-span', Object.entries(request.headers), async () => {
		console.info('Handling request in +server.ts ⌚⌚⌚')

		return new Response(\`Trace sent! Check out this random number: \${Math.random()}\`)
	})
}`,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}

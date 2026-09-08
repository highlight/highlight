import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Initialize the [Highlight JS SDK](https://www.highlight.io/docs/sdk/nodejs) in the SvelteKit [server hooks](https://svelte.dev/docs/kit/hooks#Server-hooks) file, `src/hooks.server.ts`.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: '<YOUR_SERVICE_NAME>',
})`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Add the SvelteKit error handler.',
			content:
				'Use the SvelteKit [`handleError`](https://svelte.dev/docs/kit/hooks#Server-hooks-handleError) hook to report server errors to Highlight. Parsing the request headers links backend errors to the frontend session.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

H.init({
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: '<YOUR_SERVICE_NAME>',
})

export const handleError: HandleServerError = ({ error, event }) => {
  const { secureSessionId, requestId } = H.parseHeaders(
    event.request.headers,
  )
  H.consumeError(error as Error, secureSessionId, requestId)
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'sveltekit',
			`// src/routes/+page.ts
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
  throw new Error('sample error!')
  return new Response('Hello World!')
}`,
		),
	],
}

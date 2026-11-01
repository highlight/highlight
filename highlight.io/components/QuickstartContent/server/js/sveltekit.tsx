import type { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { jsGetSnippet } from './shared-snippets-monitoring'

export const svelteKitServerHooks = `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: 'sveltekit-server',
  environment: 'production',
})

export const handle: Handle = ({ event, resolve }) =>
  H.runWithHeaders('sveltekit.request', event.request.headers, () => resolve(event))

export const handleError: HandleServerError = ({ error, event }) => {
  const { secureSessionId, requestId } = H.parseHeaders(event.request.headers)
  H.consumeError(
    error instanceof Error ? error : new Error('Unexpected SvelteKit server error'),
    secureSessionId,
    requestId,
  )
  return { message: 'Internal server error' }
}`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Monitor your SvelteKit server with the Highlight Node.js SDK.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Add server hooks.',
			content:
				'Use this integration with a Node.js runtime, such as adapter-node. It is not an edge-runtime or static-only integration. Initialize the SDK only in `src/hooks.server.ts`, never in shared or browser code. ' +
				'The handle hook traces requests and preserves the response returned by SvelteKit. The handleError hook reports unexpected server errors with the incoming Highlight session and request IDs, while returning a generic message to the browser. ' +
				"If you already have hooks, merge these changes into them; use SvelteKit's `sequence` helper to compose handle functions. Keep existing authentication and response handling. See the [SvelteKit hooks documentation](https://svelte.dev/docs/kit/hooks).",
			code: [{ text: svelteKitServerHooks, language: 'ts' }],
		},
		{
			title: 'Verify an unexpected server error.',
			content:
				"In a development environment, add this temporary route and visit `/highlight-test` from a browser with the Highlight frontend SDK initialized. Confirm the error in your Highlight project, then remove the route. Expected errors raised with SvelteKit's `error()` helper are not passed to handleError. Static assets and prerendered pages do not run these server hooks.",
			code: [
				{
					text: `// src/routes/highlight-test/+server.ts
export function GET() {
  throw new Error('Highlight SvelteKit server test')
}`,
					language: 'ts',
				},
			],
		},
	],
}

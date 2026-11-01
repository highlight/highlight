import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { jsGetSnippet } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Monitor a SvelteKit 2 server running on Node.js.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		{
			title: 'Use a Node.js deployment.',
			content:
				'This guide targets SvelteKit 2 with a Node.js adapter, such as @sveltejs/adapter-node, and @highlight-run/node 3.12.1. It does not apply to static-only deployments or edge runtimes. SvelteKit 3 changes the hook types and error hook API; do not copy this SvelteKit 2 example into a version 3 application unchanged.',
		},
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Add the server hooks.',
			content:
				'Add the following to src/hooks.server.ts and replace <YOUR_PROJECT_ID>. The build guard avoids starting exporters during prerendering. Request headers are copied into a plain object for OpenTelemetry propagation. Use the route ID rather than the full URL to avoid recording query strings and to keep span names stable. If you already export handle, compose your hooks with sequence from @sveltejs/kit/hooks; merge error reporting into your existing handleError rather than exporting it twice.',
			code: [
				{
					language: 'ts',
					text: `import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building) {
  H.init({
    projectID: '<YOUR_PROJECT_ID>',
    serviceName: 'sveltekit-server',
    environment: process.env.NODE_ENV,
  })
}

export const handle: Handle = async ({ event, resolve }) => {
  if (building) return resolve(event)

  return H.runWithHeaders(
    event.request.method + ' ' + (event.route.id ?? 'unmatched'),
    Object.fromEntries(event.request.headers),
    () => resolve(event),
  )
}

export const handleError: HandleServerError = async ({ error, event }) => {
  if (building) return

  const { secureSessionId, requestId } = H.parseHeaders(
    Object.fromEntries(event.request.headers),
  )
  await H.consumeAndFlush(
    error instanceof Error ? error : new Error(String(error)),
    secureSessionId,
    requestId,
    {
      'http.request.method': event.request.method,
      'http.route': event.route.id ?? 'unmatched',
    },
  )
}`,
				},
			],
		},
		{
			title: 'Trigger an unexpected server error.',
			content:
				'Temporarily create src/routes/highlight-test/+server.ts with the code below and request /highlight-test. Expect HTTP 500 and look for "SvelteKit Highlight test" in the Highlight errors page. Remove this test endpoint afterwards. Use throw new Error here: SvelteKit deliberately does not call handleError for expected errors created with its error() helper or for redirects. The hook keeps the default sanitized response and awaits export before completing error handling.',
			code: [
				{
					language: 'ts',
					text: `export function GET() {
  throw new Error('SvelteKit Highlight test')
}`,
				},
			],
		},
		{
			title: 'Check session linking, logs, and traces.',
			content:
				'For session linking, initialize the browser SDK with the same project ID and configure tracingOrigins according to the full-stack mapping guide. Make the request with a browser fetch so the SDK can add x-highlight-request; a direct address-bar navigation does not establish this test. Without that header the server error is still recorded but has no browser session link. In Highlight, check the server error and its linked session, then find the request span under the sveltekit-server service. Calls such as console.info inside a server route are captured as logs. These hooks explicitly trace SvelteKit requests; they do not guarantee automatic instrumentation of libraries loaded before SDK initialization.',
			code: [
				{
					language: 'js',
					text: `// Run from your application after initializing the browser SDK.
fetch('/highlight-test')`,
				},
			],
		},
	],
}

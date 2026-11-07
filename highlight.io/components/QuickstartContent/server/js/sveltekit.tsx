import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit (server)',
	subtitle:
		'Instrument SvelteKit server requests, errors, and traces using Highlight.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		jsGetSnippet(['node']),
		{
			title: 'Initialize Highlight in your server hooks',
			content:
				'This guide requires a Node.js runtime, such as adapter-node. Add the following to `src/hooks.server.ts`, using your Highlight project ID. The build guard skips initialization and tracing during prerendering. If you already have server hooks, merge this logic with them rather than replacing them. `H.runWithHeaders` takes a span name, a headers record, and a callback. Use the route ID to avoid putting user IDs or query strings in span names.',
			code: [
				{
					language: 'ts',
					text: `// src/hooks.server.ts
import { building, dev } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building) {
  H.init({
    projectID: '<YOUR_PROJECT_ID>',
    serviceName: 'sveltekit-server',
    environment: dev ? 'development' : 'production',
  })
}

export const handle: Handle = ({ event, resolve }) => {
  if (building) return resolve(event)

  const headers = Object.fromEntries(event.request.headers.entries())
  const name = event.request.method + ' ' + (event.route.id ?? 'unmatched')
  return H.runWithHeaders(name, headers, () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
  if (!building) {
    const headers = Object.fromEntries(event.request.headers.entries())
    const { secureSessionId, requestId } = H.parseHeaders(headers)
    H.consumeError(
      error instanceof Error ? error : new Error(String(error)),
      secureSessionId,
      requestId,
    )
  }
  return { message: 'Internal Error' }
}`,
				},
			],
		},
		{
			title: 'Verify requests, logs, and unexpected errors',
			content:
				'Add this temporary endpoint in a local or staging environment. Request `/health-highlight` to receive `ok` and create a trace and console log. Request `/health-highlight?error=1` to exercise `handleError`: expect HTTP 500 and a reported error. SvelteKit handles expected errors from its `error()` helper without calling `handleError`, so use a thrown Error for this check. Remove the endpoint before deploying to production.',
			code: [
				{
					language: 'ts',
					text: `// src/routes/health-highlight/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => {
  console.info('Highlight server instrumentation verification')
  if (url.searchParams.has('error')) {
    throw new Error('Highlight SvelteKit server verification error')
  }
  return new Response('ok')
}`,
				},
			],
		},
		{
			title: 'Connect browser sessions and review your data',
			content:
				'For session correlation, configure the [SvelteKit frontend SDK](/docs/getting-started/browser/svelte-kit) with the same project ID and `tracingOrigins` restricted to your own backend origin. Then call the endpoint with `fetch` from the instrumented browser. The `x-highlight-request` header links the server error and trace to the session. Direct navigation or curl without that header still produces server telemetry, but is not linked to a browser session. Check Errors, Logs, and Traces in Highlight and filter by the `sveltekit-server` service. Telemetry is buffered, so allow time for export.',
		},
		{
			title: 'Check runtime compatibility and privacy',
			content:
				'Do not import `@highlight-run/node` from `hooks.client.ts`, browser components, or an edge-only runtime. Keep request bodies, credentials, and customer information out of logs and error messages. This example targets a long-running Node server. For short-lived Node serverless handlers, await `H.flush()` after the request span has ended and before the runtime can suspend; do not call `H.stop()` on every request.',
		},
		verifyTraces,
	],
}

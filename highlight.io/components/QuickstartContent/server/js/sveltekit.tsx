import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets-tracing'
import { initializeNodeSDK, jsGetSnippet } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit (server)',
	subtitle: 'Instrument SvelteKit server requests, errors, and traces using Highlight.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add a server request hook',
			content:
				'Initialize Highlight only in server code. In `src/hooks.server.ts`, wrap SvelteKit requests with `H.runWithHeaders` so traces and errors can be correlated with browser sessions. Convert the Fetch Headers object to a plain record for the Node SDK.',
			code: [
				{
					language: 'ts',
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: 'sveltekit-server',
  environment: 'production',
})

export const handle: Handle = ({ event, resolve }) => {
  const headers = Object.fromEntries(event.request.headers.entries())
  return H.runWithHeaders(headers, () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
  const headers = Object.fromEntries(event.request.headers.entries())
  const parsed = H.parseHeaders(headers)
  H.consumeError(error instanceof Error ? error : new Error(String(error)), parsed?.secureSessionId, parsed?.requestId)
  return { message: 'Internal Error' }
}`,
				},
			],
		},
		{
			title: 'Verify instrumentation from a server endpoint',
			content:
				'Add a temporary server-only endpoint and request it from your browser. The request should create a trace in Highlight. Remove the endpoint once verification is complete.',
			code: [
				{
					language: 'ts',
					text: `// src/routes/health-highlight/+server.ts
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  const { span } = H.startWithHeaders('sveltekit-health', {})
  try {
    console.info('Highlight server instrumentation verification')
    return new Response('ok')
  } finally {
    span.end()
  }
}`,
				},
			],
		},
		{
			title: 'Check runtime compatibility and privacy',
			content:
				'The Node.js SDK requires a Node runtime (for example, adapter-node). Do not import `@highlight-run/node` from `hooks.client.ts`, browser components, or an edge-only runtime. Avoid reporting sensitive request headers or customer information. Pair frontend and backend sessions only when browser tracing is configured.',
		},
		verifyTraces,
	],
}

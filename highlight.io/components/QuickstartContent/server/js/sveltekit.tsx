import type { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

const serverHooks = `import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building && !H.isInitialized()) {
  H.init({
    projectID: '<YOUR_PROJECT_ID>',
    serviceName: 'sveltekit-server',
    environment: 'production',
  })
}

const highlightHandle: Handle = async ({ event, resolve }) => {
  if (building || !H.isInitialized()) return resolve(event)

  // OpenTelemetry propagation injects values by mutating this carrier.
  const headers = Object.fromEntries(event.request.headers)
  const route = event.route.id ?? event.url.pathname

  return H.runWithHeaders(
    \`\${event.request.method} \${route}\`,
    headers,
    async (span) => {
      const response = await resolve(event)
      span.setAttribute('http.request.method', event.request.method)
      span.setAttribute('http.route', route)
      span.setAttribute('http.response.status_code', response.status)
      return response
    },
  )
}

export const handle: Handle = highlightHandle

export const handleError: HandleServerError = ({
  error,
  event,
  status,
  message,
}) => {
  if (!building && H.isInitialized()) {
    const headers = Object.fromEntries(event.request.headers)
    const { secureSessionId, requestId } = H.parseHeaders(headers)

    // Report on a dedicated span: H.consumeError ends the span it receives.
    const { span } = H.startWithHeaders('sveltekit.error', headers)
    span.setAttribute('http.request.method', event.request.method)
    span.setAttribute('http.route', event.route.id ?? event.url.pathname)
    span.setAttribute('http.response.status_code', status)

    H.consumeError(
      error instanceof Error ? error : new Error(String(error)),
      secureSessionId,
      requestId,
      undefined,
      { span },
    )
  }

  return { message }
}`

const composeHooks = `import { sequence } from '@sveltejs/kit/hooks'

// Keep Highlight first so it wraps downstream auth, locale, and route work.
export const handle = sequence(highlightHandle, existingHandle)`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Capture server errors, logs, and traces from SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		jsGetSnippet(['node']),
		{
			title: 'Instrument requests in `hooks.server.ts`.',
			content:
				'Initialize `@highlight-run/node` in a server-only hook and wrap each request with `H.runWithHeaders`. ' +
				'Use a mutable copy of SvelteKit Web `Headers` for OpenTelemetry propagation, name traces by route, and attach the final HTTP status. ' +
				"`handleError` reports unexpected server errors on a dedicated error span so the request span is not ended early, while preserving SvelteKit's safe response message.",
			code: [{ text: serverHooks, language: 'ts' }],
		},
		{
			title: 'Compose with an existing `handle` hook.',
			content:
				"If the app already has auth, locale, or other server hooks, keep them and compose the handlers with SvelteKit's `sequence` helper.",
			code: [{ text: composeHooks, language: 'ts' }],
		},
		{
			title: 'Use a Node-compatible SvelteKit deployment.',
			content:
				'This setup uses the Highlight Node SDK, so deploy with a Node-compatible adapter such as `@sveltejs/adapter-node`. Static-only and edge-only deployments do not run this Node server hook.',
		},
		verifyError(
			'SvelteKit',
			`// src/routes/highlight-test/+server.ts
export const GET = () => {
  throw new Error('SvelteKit backend test error')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

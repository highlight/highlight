import type { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit server',
	subtitle: 'Capture server errors, logs, and traces from a SvelteKit app.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		{
			title: 'Use a Node-compatible deployment.',
			content:
				'This setup uses `@highlight-run/node` in a Node.js runtime, such as [adapter-node](https://svelte.dev/docs/kit/adapter-node). It does not apply to edge adapters or static-only deployments.',
		},
		{
			title: 'Install the Node SDK and OpenTelemetry API.',
			content:
				'`@opentelemetry/api` provides the span status code used below.',
			code: [
				{
					key: 'npm',
					text: 'npm install @highlight-run/node @opentelemetry/api',
					language: 'bash',
				},
				{
					key: 'yarn',
					text: 'yarn add @highlight-run/node @opentelemetry/api',
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: 'pnpm add @highlight-run/node @opentelemetry/api',
					language: 'bash',
				},
			],
		},
		{
			title: 'Set the project ID in the server environment.',
			content:
				'Use the same project ID as your browser SDK. Get it from [the Highlight setup page](https://app.highlight.io/setup). For local development, set it in `.env`; configure the variable in your Node host for production.',
			code: [
				{
					key: 'environment',
					text: 'HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>',
					language: 'bash',
				},
			],
		},
		{
			title: 'Add the hooks to `src/hooks.server.ts`.',
			content:
				'The request span records the route and final HTTP status. The error hook creates a child span because `H.consumeError` ends the span it receives; this keeps the request span active until the response is complete. It also returns SvelteKit’s safe error message rather than the exception text.',
			code: [
				{
					text: `import { building, dev } from '$app/environment'
import { env } from '$env/dynamic/private'
import { SpanStatusCode } from '@opentelemetry/api'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building && env.HIGHLIGHT_PROJECT_ID && !H.isInitialized()) {
	H.init({
		projectID: env.HIGHLIGHT_PROJECT_ID,
		serviceName: 'sveltekit-server',
		environment: dev ? 'development' : 'production',
	})
}

const highlightHandle: Handle = ({ event, resolve }) => {
	if (building || !H.isInitialized()) return resolve(event)

	const route = event.route.id ?? 'unmatched'
	const headers = Object.fromEntries(event.request.headers)
	return H.runWithHeaders(
		event.request.method + ' ' + route,
		headers,
		async (span) => {
			const response = await resolve(event)
			span.setAttribute('http.request.method', event.request.method)
			span.setAttribute('http.route', route)
			span.setAttribute('http.response.status_code', response.status)
			if (response.status >= 500) {
				span.setStatus({ code: SpanStatusCode.ERROR })
			}
			return response
		},
	)
}

// If this app has no other handle hook, use highlightHandle directly.
export const handle: Handle = highlightHandle

export const handleError: HandleServerError = ({
	error,
	event,
	status,
	message,
}) => {
	if (!building && H.isInitialized()) {
		const { secureSessionId, requestId } = H.parseHeaders(
			event.request.headers,
		)
		const { span } = H.startWithHeaders('sveltekit.error', {})
		span.setStatus({ code: SpanStatusCode.ERROR })
		H.consumeError(
			error instanceof Error ? error : new Error(String(error)),
			secureSessionId,
			requestId,
			{
				'http.request.method': event.request.method,
				'http.route': event.route.id ?? 'unmatched',
				'http.response.status_code': status,
			},
			{ span },
		)
	}

	return { message }
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Compose with an existing `handle` hook.',
			content:
				'Keep your current auth, locale, and other handlers. Import `sequence` from `@sveltejs/kit/hooks`, rename the existing handler, then compose `sequence(highlightHandle, existingHandle)` so Highlight wraps the downstream request work.',
			code: [
				{
					text: `import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(highlightHandle, existingHandle)`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Verify an error, log, and request trace.',
			content:
				'Temporarily add this endpoint and request `/highlight-test` and `/highlight-test?error=1`. Check the **Errors**, **Logs**, and **Traces** views for the corresponding server events. Remove the test endpoint after verification.',
			code: [
				{
					text: `// src/routes/highlight-test/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => {
	if (url.searchParams.has('error')) {
		throw new Error('SvelteKit server hook check')
	}

	console.info('SvelteKit server hook is ready')
	return json({ ok: true })
}`,
					language: 'ts',
				},
			],
		},
		verifyError('SvelteKit'),
		verifyLogs,
		verifyTraces,
	],
}

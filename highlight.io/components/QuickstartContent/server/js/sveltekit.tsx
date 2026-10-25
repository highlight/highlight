import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on the server side of your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the SDK and wrap requests in `src/hooks.server.ts`.',
			content:
				'SvelteKit runs every server request (pages, `+page.server.ts` loads, form actions and `+server.ts` endpoints) through the `handle` hook. ' +
				'Initialize the [Highlight Node.js SDK](https://www.highlight.io/docs/sdk/nodejs) once at module load, then wrap `resolve` with `H.runWithHeaders` so each request gets a span ' +
				'that is linked to the frontend session via the `x-highlight-request` header. ' +
				'Logs written with `console` methods during the request are attached to the same trace. ' +
				'The snippet uses SvelteKit 2; on SvelteKit 3, import `Handle` and `HandleServerError` from `@sveltejs/kit/hooks` instead.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'
import { env } from '$env/dynamic/private'

if (!H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-app',
		environment: env.NODE_ENV ?? 'production',
	})
}

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		\`\${event.request.method} \${event.route.id ?? event.url.pathname}\`,
		event.request.headers,
		async (span) => {
			span.setAttribute('http.route', event.route.id ?? '')
			const response = await resolve(event)
			span.setAttribute('http.status_code', response.status)
			return response
		},
	)
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report unexpected errors with `handleError`.',
			content:
				'SvelteKit calls `handleError` for errors thrown in loads, actions and endpoints that are not created with `error()`. ' +
				'Forward them to Highlight with the session and request IDs parsed from the incoming headers. ' +
				'If you deploy to a serverless adapter (Vercel, Netlify, AWS), call `await H.flush()` so data is sent before the function is frozen.',
			code: [
				{
					text: `// src/hooks.server.ts (continued)
export const handleError: HandleServerError = async ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		event.request.headers,
	)
	H.consumeError(
		error instanceof Error ? error : new Error(String(error)),
		secureSessionId,
		requestId,
		{ 'sveltekit.route': event.route.id ?? event.url.pathname },
	)
	await H.flush() // recommended on serverless adapters

	return { message: 'Internal Error' }
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Connect your frontend session to backend traces.',
			content:
				'If you also use the [SvelteKit browser SDK](https://www.highlight.io/docs/getting-started/browser/svelte-kit), initialize it in `src/hooks.client.ts` with `tracingOrigins` so `fetch` calls to your own server include the `x-highlight-request` header that `H.runWithHeaders` and `H.parseHeaders` read.',
			code: [
				{
					text: `// src/hooks.client.ts
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
	tracingOrigins: true,
	networkRecording: { enabled: true, recordHeadersAndBody: true },
})`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
export const GET = () => {
	throw new Error('example error!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

import type { QuickStartContent } from '../../QuickstartContent'
import { jsGetSnippet } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Capture server errors, logs, and traces in your SvelteKit app.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		{
			title: 'Use a Node.js server runtime.',
			content:
				'This guide uses `@highlight-run/node` with a SvelteKit app running on Node.js, such as one deployed with [`@sveltejs/adapter-node`](https://svelte.dev/docs/kit/adapter-node). It does not cover edge runtimes. A fully static deployment has no SvelteKit server to instrument. Keep the Node SDK in server-only files.',
		},
		jsGetSnippet(['node']),
		{
			title: 'Instrument requests and unexpected errors.',
			content:
				'Add the following to `src/hooks.server.ts`, replacing `<YOUR_PROJECT_ID>` with your [Highlight project ID](https://app.highlight.io/setup). The `building` guard avoids initializing telemetry during builds and prerendering. `H.runWithHeaders` takes a span name, a plain header object, and a callback. Use the route ID to group requests without including user-specific URL values.\n\n' +
				"SvelteKit converts route errors into responses inside `resolve`, so a catch around `resolve` is not sufficient to report them. The [`handleError` hook](https://svelte.dev/docs/kit/hooks#handleError) reports unexpected server errors and returns a generic message to the client. Parse the incoming headers explicitly and pass both IDs to `H.consumeError` so the SDK can associate the error with the incoming session. Errors deliberately raised with SvelteKit's `error(...)` helper do not invoke `handleError`.",
			code: [
				{
					language: 'ts',
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'sveltekit-server',
		environment: 'development',
	})
}

export const handle: Handle = ({ event, resolve }) => {
	if (building) return resolve(event)

	return H.runWithHeaders(
		\`\${event.request.method} \${event.route.id ?? 'unmatched'}\`,
		Object.fromEntries(event.request.headers),
		() => resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	if (!building) {
		const { secureSessionId, requestId } = H.parseHeaders(
			Object.fromEntries(event.request.headers),
		)
		H.consumeError(
			error instanceof Error ? error : new Error(String(error)),
			secureSessionId,
			requestId,
		)
	}

	return { message: 'An unexpected error occurred.' }
}`,
				},
			],
		},
		{
			title: 'Preserve your existing hooks.',
			content:
				"If you already export `handle`, name the Highlight hook `highlightHandle` and compose it before your existing hook with SvelteKit's [`sequence`](https://svelte.dev/docs/kit/@sveltejs-kit-hooks#sequence) helper. Keep your authentication and response logic intact. If you already export `handleError`, add the `H.consumeError` call there and preserve its existing return value; do not export a second error hook or report the same error twice.",
			code: [
				{
					language: 'ts',
					text: `import { sequence } from '@sveltejs/kit/hooks'

// After defining highlightHandle and your existing handle hook:
export const handle = sequence(highlightHandle, existingHandle)`,
				},
			],
		},
		{
			title: 'Connect browser requests to server telemetry.',
			content:
				'Follow the [SvelteKit browser quickstart](/docs/getting-started/browser/svelte-kit) using the same project ID. Configure `tracingOrigins` for the backend origins you own. Instrumented browser requests carry `x-highlight-request`, which the server hooks use to associate telemetry with the browser session.\n\n' +
				'Test with a browser `fetch` to a server endpoint after the client SDK has initialized. An initial document navigation, a command-line request, or a server-to-server request may have no Highlight header; it can still produce server telemetry, but there is no browser session to associate from that header. For cross-origin requests, make sure your Cross-Origin Resource Sharing (CORS) policy permits the tracing headers. Static assets and already prerendered pages do not run through the server `handle` hook.',
		},
		{
			title: 'Verify successful and failing requests.',
			content:
				'Add this temporary endpoint in development. Start the app, request `/api/highlight-test`, then request `/api/highlight-test?fail=1`. Expect a successful response followed by a 500 response with the generic error message. In your Highlight project, check for the server log, request trace, and unexpected error under `sveltekit-server`. A local 500 response alone does not prove that Highlight received the error.\n\n' +
				'Repeat the failing request from the initialized browser client and check the linked session. If telemetry is missing, check the project ID, environment filters, server runtime, and outbound connectivity. If only the session link is missing, inspect the incoming `x-highlight-request` header. Remove this intentional-error endpoint before deploying your app.',
			code: [
				{
					language: 'ts',
					text: `// src/routes/api/highlight-test/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => {
	console.info('SvelteKit Highlight verification', { route: 'highlight-test' })
	if (url.searchParams.has('fail')) {
		throw new Error('SvelteKit Highlight verification error')
	}
	return json({ ok: true })
}`,
				},
			],
		},
	],
}

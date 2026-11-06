import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import { jsGetSnippet, setupLogging, verifyError } from './shared-snippets'

const initServerHooksSnippet = `// src/hooks.server.ts
import { H } from '@highlight-run/node'

// Initialize highlight.io once, when the server starts.
H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})
`

const handleTracingSnippet = `// src/hooks.server.ts (optional: distributed tracing)
import { H } from '@highlight-run/node'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	// Wrap each request in a highlight.io trace, linked to the frontend
	// session via the headers your client sends when 'tracingOrigins' is on.
	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		event.request.headers,
		() => resolve(event),
	)
}
`

const handleErrorSnippet = `// src/hooks.server.ts (continued)
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = async ({ error, event }) => {
	// Pair this backend error with the frontend session. The highlight.io
	// client (set up in hooks.client.ts with 'tracingOrigins') sends the
	// session + request ids on outgoing requests; parse them here.
	const parsed = H.parseHeaders(event.request.headers)

	if (parsed?.secureSessionId && parsed?.requestId) {
		H.consumeError(
			error as Error,
			parsed.secureSessionId,
			parsed.requestId,
		)
	} else {
		H.consumeError(error as Error)
	}

	return {
		message: 'An unexpected error occurred.',
	}
}
`

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on your SvelteKit backend (server hooks).',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the highlight.io SDK in `hooks.server.ts`.',
			content:
				'SvelteKit runs server code through `src/hooks.server.ts`. ' +
				'Initialize highlight.io once at module scope so it starts with ' +
				'your server. Grab your project ID from ' +
				'[app.highlight.io/setup](https://app.highlight.io/setup).',
			code: [
				{
					text: initServerHooksSnippet,
					language: 'js',
				},
			],
		},
		{
			title: 'Report server errors with the `handleError` hook.',
			content:
				"SvelteKit calls the `handleError` server hook whenever an " +
				'unexpected error is thrown while responding to a request. ' +
				'Forward those errors to highlight.io, and use `H.parseHeaders` ' +
				'to link them to the originating frontend session (make sure ' +
				'`tracingOrigins` is enabled in your `hooks.client.ts` setup).',
			code: [
				{
					text: handleErrorSnippet,
					language: 'js',
				},
			],
		},
		{
			title: 'Optionally, trace requests with the `handle` hook.',
			content:
				'To capture distributed traces (and link them to the frontend ' +
				'session), wrap each request in `H.runWithHeaders` from a ' +
				'SvelteKit `handle` hook in the same `hooks.server.ts` file.',
			code: [
				{
					text: handleTracingSnippet,
					language: 'js',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// Throw inside any +page.server.ts load or form action, or any
// +server.ts request handler, to verify errors reach highlight.io:
export async function load() {
	throw new Error('Highlight SvelteKit backend test error!')
}
`,
		),
		setupLogging('nodejs'),
	],
}

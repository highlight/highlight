import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { jsGetSnippet, verifyError } from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io for the server side of your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		{
			title: 'Use a Node.js-compatible adapter.',
			content:
				'This guide uses [`@highlight-run/node`](https://www.npmjs.com/package/@highlight-run/node) with a SvelteKit app running on Node.js (for example [`@sveltejs/adapter-node`](https://svelte.dev/docs/kit/adapter-node)). Edge or fully static adapters do not run a Node server to instrument. Keep the Node SDK in server-only files such as `hooks.server.ts`, `+server.ts`, and `+page.server.ts`.',
		},
		jsGetSnippet(['node']),
		{
			title: 'Instrument `hooks.server.ts`.',
			content:
				`Initialize the [Highlight Node SDK](${siteUrl(
					'/docs/sdk/nodejs',
				)}) in \`src/hooks.server.ts\`. Skip initialization when \`building\` is true so builds and prerendering do not start telemetry.\n\n` +
				"`H.runWithHeaders(name, headers, cb)` expects a **plain object** for headers — convert SvelteKit's `Headers` with `Object.fromEntries(...)` first. OpenTelemetry injects into that object; passing the request `Headers` instance can fail or drop context.\n\n" +
				"Wrap `resolve` in the [`handle`](https://svelte.dev/docs/kit/hooks#Shared-hooks-handle) hook to create a request span. Report unexpected errors in [`handleError`](https://svelte.dev/docs/kit/hooks#Shared-hooks-handleError) with `H.parseHeaders` + `H.consumeError` so they link to the browser session when `x-highlight-request` is present. Errors raised with SvelteKit's `error(...)` helper do not invoke `handleError`.",
			code: [
				{
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'sveltekit-server',
		serviceVersion: 'git-sha',
		environment: 'production',
	})
}

export const handle: Handle = ({ event, resolve }) => {
	if (building) {
		return resolve(event)
	}

	const headers = Object.fromEntries(event.request.headers)

	return H.runWithHeaders(
		\`\${event.request.method} \${event.route.id ?? 'unmatched'}\`,
		headers,
		() => resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	if (!building) {
		const headers = Object.fromEntries(event.request.headers)
		const { secureSessionId, requestId } = H.parseHeaders(headers)
		H.consumeError(
			error instanceof Error ? error : new Error(String(error)),
			secureSessionId,
			requestId,
		)
	}

	return { message: 'An unexpected error occurred.' }
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Compose with existing hooks (optional).',
			content:
				"If you already export `handle`, define a `highlightHandle` and compose with SvelteKit's [`sequence`](https://svelte.dev/docs/kit/@sveltejs-kit-hooks#sequence) helper. If you already export `handleError`, add the `H.consumeError` call there and keep the existing return value — do not export two error hooks.",
			code: [
				{
					text: `import { sequence } from '@sveltejs/kit/hooks'

// After defining highlightHandle and your existing handle:
export const handle = sequence(highlightHandle, existingHandle)`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Report errors from server routes (optional).',
			content:
				'In `+server.ts` handlers or `+page.server.ts` load functions, call `H.consumeError` inside your own try/catch when you handle the failure without rethrowing to `handleError`.',
			code: [
				{
					text: `// src/routes/api/checkout/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	try {
		// do something dangerous...
		throw new Error('checkout failed')
	} catch (error) {
		const headers = Object.fromEntries(request.headers)
		const { secureSessionId, requestId } = H.parseHeaders(headers)
		H.consumeError(error as Error, secureSessionId, requestId)
		return json({ ok: false }, { status: 500 })
	}
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Connect browser sessions (recommended).',
			content: `Follow the [SvelteKit browser quickstart](${siteUrl(
				'/docs/getting-started/browser/svelte-kit',
			)}) with the same project ID and enable \`tracingOrigins\` for your backend origins. Instrumented browser requests send \`x-highlight-request\`, which the server hooks use to associate errors and traces with the session.`,
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/highlight-test/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = () => {
	console.info('SvelteKit Highlight verification')
	throw new Error('sample error from sveltekit')
	return json({ ok: true })
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

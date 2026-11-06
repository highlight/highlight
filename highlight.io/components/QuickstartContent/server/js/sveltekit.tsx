import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Initialize Highlight and wrap requests in `src/hooks.server.ts`.',
			content:
				'SvelteKit runs server-side code through the `handle` and `handleError` hooks in `src/hooks.server.ts`. Initialize the Highlight Node SDK there, and wrap `resolve(event)` with `H.runWithHeaders` so every request creates a span tied to the Highlight session. Use `handleError` to report unexpected errors with `H.consumeError`.\n\n' +
				'**Note:** `event.request.headers` is a Fetch API `Headers` object. The Node SDK accepts `Headers` directly, but converting to a plain object with `Object.fromEntries(...)` keeps examples explicit and avoids surprises across runtimes.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightConfig = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production',
}

H.init(highlightConfig)

// \`event.request.headers\` is a Fetch API \`Headers\` object.
// Convert it to a plain object before passing it to the Highlight SDK.
const toHeadersObject = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		toHeadersObject(event.request.headers),
		() => resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(toHeadersObject(event.request.headers))
	H.consumeError(error as Error, parsed.secureSessionId, parsed.requestId)

	return {
		message: 'An unexpected error occurred',
	}
}`,
					language: 'ts',
				},
			],
		},
		{
			title: 'Use a Node.js-compatible adapter.',
			content:
				'The `@highlight-run/node` SDK relies on Node.js APIs, so your SvelteKit app must run in a Node.js environment. If you deploy with `@sveltejs/adapter-auto`, make sure your host does not select an edge runtime — or switch to `@sveltejs/adapter-node`.',
			code: [
				{
					text: `// svelte.config.js
import adapter from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
	},
}

export default config`,
					language: 'js',
				},
			],
		},
		{
			title: 'Trace requests in endpoints (optional).',
			content:
				'You can also create spans manually in SvelteKit endpoints with `H.startWithHeaders`. Console logs are captured automatically and tied to the active span.',
			code: [
				{
					text: `// src/routes/api/hello/+server.ts
import { json } from '@sveltejs/kit'
import { H } from '@highlight-run/node'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	// Convert the Fetch API \`Headers\` object to a plain object.
	const headers = Object.fromEntries(request.headers.entries())
	const { span } = H.startWithHeaders('GET /api/hello', headers)

	console.log('Hello from a SvelteKit endpoint!') // captured as a Highlight log

	span.end()

	return json({ message: 'Hello from Highlight!' })
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/+page.server.ts
export const load = () => {
	throw new Error('sample error!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

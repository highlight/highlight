import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on your SvelteKit backend using hooks.server.ts.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the SDK and instrument your server hooks.',
			content:
				'In SvelteKit, server-side instrumentation lives in `src/hooks.server.ts` (or `.js`). ' +
				'Initialize the Highlight Node SDK and wrap your request handler with `H.runWithHeaders` ' +
				'so that every server request is traced and correlated with frontend sessions. ' +
				'See the [SvelteKit hooks docs](https://kit.svelte.dev/docs/hooks) for more details.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	return await H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		event.request.headers,
		async () => {
			return await resolve(event)
		},
	)
}

export const handleError: HandleServerError = async ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(
		event.request.headers,
	)

	if (error instanceof Error) {
		H.consumeError(error, secureSessionId, requestId)
	}

	return {
		message: 'An unexpected error occurred.',
	}
}
`,
					language: 'js',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`// src/routes/+page.server.ts
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	throw new Error('Test error from SvelteKit server load function')
}
`,
		),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	console.log('Loading page data')
	console.warn('This is a warning', { key: 'value' })
	return {}
}`,
					language: 'js',
				},
			],
		},
		verifyLogs,
		{
			title: 'Instrument server routes for tracing.',
			content:
				'`H.runWithHeaders` in your `handle` hook automatically traces every request. ' +
				'You can add additional custom spans within server load functions or API routes ' +
				'using `H.startWithHeaders`.',
			code: [
				{
					text: `// src/routes/api/data/+server.ts
import { H } from '@highlight-run/node'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	const { secureSessionId } = H.parseHeaders(request.headers)
	const { span } = H.startWithHeaders('fetch-data', request.headers, {
		attributes: { 'session.id': secureSessionId ?? '' },
	})

	try {
		// your data fetching logic here
		const data = { example: true }
		return json(data)
	} finally {
		span.end()
	}
}`,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}

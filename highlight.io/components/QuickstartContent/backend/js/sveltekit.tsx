import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in SvelteKit.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Configure the SvelteKit server hooks.',
			content:
				'In `src/hooks.server.ts`, initialize the Node.js SDK, wrap incoming requests with `H.runWithHeaders` inside `handle`, and report uncaught exceptions via `H.consumeError` inside [`handleError`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror). Convert the Web Fetch `Headers` object using `Object.fromEntries(event.request.headers)` so Highlight can extract session and request identifiers.',
			code: [
				{
					text: `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers)
	return H.runWithHeaders(headers, () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(\`Unknown server error: \${JSON.stringify(error)}\`),
			parsed.secureSessionId,
			parsed.requestId,
		)
	}
}`,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('example sveltekit server error!')
}`,
		),
		setupLogging('sveltekit'),
	],
}

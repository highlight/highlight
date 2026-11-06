import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	jsGetSnippet,
	manualError,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on your SvelteKit server backend.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Add the Highlight server hooks in `src/hooks.server.ts`.',
			content:
				'Initialize `H.init` from `@highlight-run/node` inside `src/hooks.server.ts` and export `handle` and `handleError` hooks to trace requests and report uncaught backend exceptions.',
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
	return await H.runWithHeaders(
		`${event.request.method} ${event.url.pathname}`,
		headers,
		() => resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(Object.fromEntries(event.request.headers))
	H.consumeError(error as Error, parsed.secureSessionId, parsed.requestId)
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
	throw new Error('Example SvelteKit server error!')
}`,
		),
		setupLogging('sveltekit'),
	],
}

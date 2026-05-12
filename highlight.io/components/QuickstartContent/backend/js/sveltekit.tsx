import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import { initializeNodeSDK, jsGetSnippet, verifyError } from './shared-snippets'

const svelteKitServerHookSnippet = `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		'sveltekit.server',
		event.request.headers,
		() => resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)
	const errorObject =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(errorObject, parsed.secureSessionId, parsed.requestId)
}`

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit backend.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add Highlight to your SvelteKit server hooks.',
			content:
				'Initialize the Node.js SDK in `hooks.server.ts`, wrap SvelteKit requests with `H.runWithHeaders`, and report unexpected server errors from `handleError`. This keeps backend errors and traces linked to the frontend session through the `x-highlight-request` header.',
			code: [
				{
					text: svelteKitServerHookSnippet,
					language: 'ts',
				},
			],
		},
		{
			title: 'Keep frontend-to-backend mapping enabled.',
			content:
				'Make sure your SvelteKit frontend Highlight setup includes `tracingOrigins: true` or an explicit origin list for your server routes. That allows Highlight to attach the request header that `H.runWithHeaders` reads on the backend.',
		},
		verifyError('SvelteKit', svelteKitServerHookSnippet),
	],
}

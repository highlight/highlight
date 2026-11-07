import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	jsGetSnippet,
	manualError,
	setupLogging,
	verifyError,
} from './shared-snippets'

// Legacy backend quickstart entry for SvelteKit server instrumentation.
export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit backend.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight Node.js SDK in hooks.server.ts.',
			content:
				'Initialize `@highlight-run/node` in `src/hooks.server.ts` and export `handle` and `handleError` hooks. Convert `event.request.headers` with `Object.fromEntries(event.request.headers)` before calling `H.runWithHeaders` or `H.parseHeaders`.',
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
		\`\${event.request.method} \${event.url.pathname}\`,
		headers,
		() => resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
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
import { H } from '@highlight-run/node'

export const GET: RequestHandler = async ({ request }) => {
	const headers = Object.fromEntries(request.headers)
	const parsed = H.parseHeaders(headers)

	try {
		throw new Error('example sveltekit server error!')
	} catch (error) {
		H.consumeError(
			error as Error,
			parsed.secureSessionId,
			parsed.requestId,
		)
		throw error
	}
}`,
		),
		setupLogging('sveltekit'),
	],
}

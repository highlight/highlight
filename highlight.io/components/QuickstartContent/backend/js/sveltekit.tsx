import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import { jsGetSnippet, verifyError } from './shared-snippets'

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in your SvelteKit server.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize the Highlight Node.js SDK and report server errors.',
			content:
				'SvelteKit runs your server code on Node.js, so use the [@highlight-run/node](https://www.npmjs.com/package/@highlight-run/node) SDK. ' +
				'Initialize it once in `src/hooks.server.ts` and export a `handleError` hook. ' +
				'SvelteKit calls this hook for every unexpected error thrown in `load`, form actions, API routes and `handle`. ' +
				"`H.parseHeaders` accepts the request's `Headers`, so the error is linked to the user's session when the frontend SDK is also installed.",
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: '<YOUR_SERVICE_NAME>',
	environment: 'production',
})

export const handleError: HandleServerError = ({ error, event }) => {
	// SvelteKit gives you the Web Request, so its Headers can be passed to the SDK as-is.
	const parsed = H.parseHeaders(event.request.headers)
	if (error instanceof Error) {
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
	}

	return { message: 'Internal Error' }
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('example error!')
}`,
		),
	],
}

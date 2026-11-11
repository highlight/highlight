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
	subtitle: 'Learn how to set up highlight.io on the backend in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Initialize Highlight in your server hooks',
			content:
				'In SvelteKit, server-side request and error handling are managed via server hooks. ' +
				'Initialize Highlight with your `projectID` in `src/hooks.server.ts` (or `src/hooks.server.js`), ' +
				'and export `handle` and `handleError` to automatically trace requests and capture errors.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})

// Trace server-side requests and correlate with frontend sessions
export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		Object.fromEntries(event.request.headers),
		() => resolve(event),
	)
}

// Automatically report uncaught server errors
export const handleError: HandleServerError = ({ error, event, status }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)
	const err = error instanceof Error ? error : new Error(String(error))

	H.consumeError(err, parsed?.secureSessionId, parsed?.requestId, {
		'http.status_code': status,
		'http.route': event.url.pathname,
	})
}`,
					language: 'ts',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`// src/routes/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	console.log('Testing Highlight logging in SvelteKit server load')
	// Uncaught errors in load functions are passed directly to handleError in hooks.server.ts
	throw new Error('Test server error for Highlight.io')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

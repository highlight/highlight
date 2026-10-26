import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on your SvelteKit backend with the Node.js SDK.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Instrument SvelteKit server hooks.',
			content:
				'In `src/hooks.server.ts`, initialize `@highlight-run/node`, wrap incoming requests in `H.runWithHeaders` inside the `handle` hook to propagate session and trace context, and export `handleError` to report uncaught server-side exceptions.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	serviceVersion: 'git-sha',
	environment: 'production',
}

if (!H.isInitialized()) {
	H.init(highlightOptions)
}

const headersToRecord = (headers: Headers) =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	const headers = headersToRecord(event.request.headers)

	return await H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		headers,
		async () => {
			return await resolve(event)
		},
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(headersToRecord(event.request.headers))
	const err =
		error instanceof Error
			? error
			: new Error(\`Unexpected SvelteKit server error: \${JSON.stringify(error)}\`)

	H.consumeError(err, parsed?.secureSessionId, parsed?.requestId, {
		routeId: event.route.id ?? 'unknown',
		url: event.url.pathname,
	})
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/health/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('example SvelteKit server error!')
}`,
		),
		setupLogging('sveltekit'),
	],
}

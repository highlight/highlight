import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io in your SvelteKit server hooks.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Configure the SvelteKit server hooks.',
			content:
				addIntegrationContent('Node Highlight SDK', 'nodejs') +
				' ' +
				'Initialize `@highlight-run/node` in `src/hooks.server.ts` using `handle` and `handleError` ' +
				'to trace requests, link frontend sessions via `x-highlight-request`, and report unhandled exceptions.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H, type NodeOptions } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightConfig: NodeOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	serviceVersion: 'git-sha',
	environment: 'production',
}

H.init(highlightConfig)

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	return await H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		headers,
		() => resolve(event),
	)
}

export const handleError: HandleServerError = async ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const { secureSessionId, requestId } = H.parseHeaders(headers)
	const err = error instanceof Error ? error : new Error(String(error))

	H.consumeError(err, secureSessionId, requestId, {
		route: event.route.id ?? event.url.pathname,
		method: event.request.method,
	})

	await H.flush()

	return {
		message: 'An unexpected server error occurred.',
	}
}`,
					language: 'ts',
				},
			],
		},
		verifyError(
			'SvelteKit',
			`// src/routes/api/test-error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = () => {
	throw new Error('Example SvelteKit server error!')
}`,
		),
		setupLogging('sveltekit'),
	],
}

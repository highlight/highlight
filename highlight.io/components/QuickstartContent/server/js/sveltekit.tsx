import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle: 'Learn how to set up highlight.io in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Configure the SvelteKit server hooks.',
			content:
				addIntegrationContent('Node Highlight SDK', 'nodejs') +
				' ' +
				'Initialize `@highlight-run/node` inside `src/hooks.server.ts` (or `src/hooks.server.js`) ' +
				'using SvelteKit `handle` and `handleError` hooks. `H.runWithHeaders` propagates distributed traces and correlates backend logs and exceptions with the frontend session.',
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
		verifyLogs,
		verifyTraces,
	],
}

import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up Highlight backend error monitoring, logging, and tracing in SvelteKit.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			title: 'Configure Highlight in SvelteKit server hooks',
			content:
				addIntegrationContent('Node SDK', 'nodejs') +
				' ' +
				'In SvelteKit, server-side request interception and global exception handling are managed via server hooks. ' +
				'Create or update `src/hooks.server.ts` (or `src/hooks.server.js`) to initialize Highlight, trace incoming requests with `handle`, and capture uncaught server errors with `handleError`. ' +
				'We use the `!building` check from `$app/environment` so that Highlight is not initialized during static analysis, pre-rendering, or `vite build`.',
			code: [
				{
					text: `// src/hooks.server.ts
import { building } from '$app/environment'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

// 1. Initialize Highlight (guard against build/prerender execution)
if (!building) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-backend',
		environment: 'production',
	})
}

// 2. Intercept and trace server requests with context propagation
export const handle: Handle = async ({ event, resolve }) => {
	if (building || !H.isInitialized()) {
		return resolve(event)
	}

	// SvelteKit request headers are Web Fetch Headers.
	// Convert to a dictionary so Highlight & OpenTelemetry can extract/inject trace context.
	const headers = Object.fromEntries(event.request.headers)
	const spanName = \`\${event.request.method} \${event.route.id ?? event.url.pathname}\`

	return H.runWithHeaders(spanName, headers, async () => {
		return resolve(event)
	})
}

// 3. Automatically capture uncaught server errors
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	if (!building && H.isInitialized()) {
		const headers = Object.fromEntries(event.request.headers)
		const { secureSessionId, requestId } = H.parseHeaders(headers)
		const err = error instanceof Error ? error : new Error(String(error))

		H.consumeError(err, secureSessionId, requestId, {
			'http.status_code': status,
			'http.route': event.route.id ?? event.url.pathname,
			'http.method': event.request.method,
			'http.url': event.url.href,
		})
	}

	return {
		message: message || 'An unexpected error occurred.',
	}
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
	console.log('Testing Highlight server logs in SvelteKit')
	// Throwing an uncaught error in load() triggers handleError in hooks.server.ts
	throw new Error('Test server error from SvelteKit load function!')
}`,
		),
		verifyLogs,
		verifyTraces,
	],
}

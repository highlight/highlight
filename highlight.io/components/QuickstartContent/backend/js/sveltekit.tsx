import { siteUrl } from '../../../../utils/urls'
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
	subtitle: 'Learn how to set up highlight.io in your SvelteKit backend.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the SvelteKit server hooks.',
			content: `In \`src/hooks.server.ts\` (or \`src/hooks.server.js\`), initialize \`@highlight-run/node\`, wrap incoming requests with \`H.runWithHeaders\` inside the [\`handle\`](https://kit.svelte.dev/docs/hooks#server-hooks-handle) hook so logs and spans are correlated with frontend sessions, and capture uncaught server errors in [\`handleError\`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror). Read more about the [Highlight Node.js SDK](${siteUrl(
				'/docs/sdk/nodejs',
			)}).`,
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

	return await H.runWithHeaders(headers, async () => {
		return await resolve(event)
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers)
	const parsed = H.parseHeaders(headers)

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(
			new Error(\`Unhandled SvelteKit server error: \${JSON.stringify(error)}\`),
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
			`// src/routes/api/test-error/+server.ts
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	throw new Error('Example SvelteKit server error!')
}`,
		),
		setupLogging('sveltekit'),
	],
}

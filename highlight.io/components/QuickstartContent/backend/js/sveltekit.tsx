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
	subtitle: 'Learn how to set up highlight.io backend instrumentation in SvelteKit.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		{
			...initializeNodeSDK('node'),
			content:
				'Initialize the [Highlight JS SDK](/docs/sdk/nodejs) in your SvelteKit server hooks. ' +
				'Create or update `src/hooks.server.ts` to initialize Highlight with your project ID.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})

export const handle = async ({ event, resolve }) => {
	return resolve(event)
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Capture server-side errors.',
			content:
				'Wrap your handle function with Highlight error capture to automatically report server-side exceptions.',
			code: [
				{
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-app',
	environment: 'production',
})

export const handle = async ({ event, resolve }) => {
	try {
		return await resolve(event)
	} catch (error) {
		H.consumeError(error)
		throw error
	}
}`,
					language: 'js',
				},
			],
		},
		{
			title: 'Instrument API routes.',
			content:
				'For SvelteKit API routes (+server.ts files), wrap your handlers to capture errors.',
			code: [
				{
					text: `// src/routes/api/+server.ts
import { json } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

export const GET = async ({ url }) => {
	try {
		const data = await fetchData()
		return json(data)
	} catch (error) {
		H.consumeError(error)
		return json({ error: 'Internal server error' }, { status: 500 })
	}
}`,
					language: 'js',
				},
			],
		},
		manualError,
		verifyError(
			'SvelteKit',
			`// In any server-side route or hook:
throw new Error('test server error')`,
		),
		setupLogging('nodejs'),
	],
}

import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	verifySnippet,
} from './shared-snippets'

import { QuickStartContent } from '../QuickstartContent'

const svelteKitInitCodeSnippet = `// hooks.client.ts
...

import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    environment: 'production',
    version: 'commit:abcdefg12345',
    tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
        urlBlocklist: [
            // insert full or partial urls that you don't want to record here
			// Out of the box, Highlight will not record these URLs (they can be safely removed):
			"https://www.googleapis.com/identitytoolkit",
			"https://securetoken.googleapis.com",
        ],
	},
});
...
`

const svelteKitPackageInstallSnippet = {
	...packageInstallSnippet,
	content:
		'Install the `highlight.run` browser SDK and the `@highlight-run/node` server SDK with your package manager.',
	code: [
		{
			key: 'yarn',
			text: 'yarn add highlight.run @highlight-run/node',
			language: 'bash',
		},
		{
			key: 'pnpm',
			text: 'pnpm add highlight.run @highlight-run/node',
			language: 'bash',
		},
		{
			key: 'npm',
			text: 'npm install highlight.run @highlight-run/node',
			language: 'bash',
		},
	],
}

const svelteKitBackendInstrumentationSnippet = {
	title: 'Instrument your SvelteKit backend.',
	content:
		'Create or update `src/hooks.server.ts` to initialize the Node SDK, wrap each request, and report unexpected server errors. Convert the Web `Headers` object to a plain object before passing it to the SDK. The `tracingOrigins` option above sends the Highlight request header used to associate backend telemetry with the frontend session. This setup requires a Node-compatible SvelteKit adapter.',
	code: [
		{
			language: 'ts',
			text: `// src/hooks.server.ts
import { env } from '$env/dynamic/private'
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const projectID = env.HIGHLIGHT_PROJECT_ID

if (!projectID) {
	throw new Error('HIGHLIGHT_PROJECT_ID is required')
}

H.init({
	projectID,
	serviceName: env.HIGHLIGHT_SERVICE_NAME ?? 'sveltekit',
	environment: env.HIGHLIGHT_ENVIRONMENT ?? 'production',
})

const headersToObject = (headers: Headers): Record<string, string> =>
	Object.fromEntries(headers.entries())

export const handle: Handle = async ({ event, resolve }) => {
	const headers = headersToObject(event.request.headers)

	return H.runWithHeaders('sveltekit.request', headers, () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = headersToObject(event.request.headers)
	const { secureSessionId, requestId } = H.parseHeaders(headers)
	const reportedError =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(reportedError, secureSessionId, requestId)

	return { message: 'Internal server error' }
}`,
		},
	],
}

export const SvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io with your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Sessions', 'Errors', 'Logs', 'Traces'],
	entries: [
		svelteKitPackageInstallSnippet,
		{
			...initializeSnippet,
			content:
				'In SvelteKit, we recommend initializing highlight.io in the `hooks.client.js` or `hooks.client.ts` file. You can find more details about this file in the SvelteKit docs [here](https://kit.svelte.dev/docs/hooks). To get started, we recommend setting `tracingOrigins` and `networkRecording` so that we can pass a header to pair frontend and backend errors. \n\n\n' +
				`Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method.`,
			code: [
				{
					...initializeSnippet.code,
					text: svelteKitInitCodeSnippet,
					language: initializeSnippet.code?.[0]?.language ?? 'js',
				},
			],
		},
		{
			title: 'Confirm CSS is served by absolute path.',
			content:
				'SvelteKit may generate CSS paths that are relative ' +
				'which may interfere with our logic to fetch stylesheets. ' +
				'Update your `svelte.config.js` to disable relative paths. ' +
				'[See the SvelteKit docs here for more details](https://kit.svelte.dev/docs/configuration#paths).',
			code: [
				{
					language: 'js',
					text: `/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        paths: {
            relative: false
        }
    }
};

export default config;`,
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		svelteKitBackendInstrumentationSnippet,
	],
}

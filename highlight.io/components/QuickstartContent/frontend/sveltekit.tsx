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

const svelteKitBackendInstallSnippet = `# with yarn
yarn add @highlight-run/node

# with pnpm
pnpm add @highlight-run/node

# with npm
npm install @highlight-run/node`

const svelteKitBackendInitSnippet = `// hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	serviceVersion: 'git-sha',
})

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(event.request.headers, async () => {
		return resolve(event)
	})
}

export const handleError: HandleServerError = async ({ error, event }) => {
	const parsed = H.parseHeaders(event.request.headers)

	H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)

	return {
		message: 'Internal Error',
	}
}`

export const SvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io with your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Sessions', 'Errors', 'Logs', 'Traces'],
	entries: [
		packageInstallSnippet,
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
		{
			title: 'Install the backend SDK.',
			content:
				'To capture backend logs, errors, and traces from SvelteKit server hooks, install the Node.js SDK alongside the browser SDK.',
			code: [
				{
					text: svelteKitBackendInstallSnippet,
					language: 'bash',
				},
			],
		},
		{
			title: 'Initialize the SDK in your backend.',
			content:
				'Initialize Highlight in `hooks.server.ts`, wrap the SvelteKit `handle` hook with `H.runWithHeaders` to propagate the `x-highlight-request` header, and export `handleError` so uncaught server errors are linked back to the originating session.',
			code: [
				{
					text: svelteKitBackendInitSnippet,
					language: 'ts',
				},
			],
		},
	],
}

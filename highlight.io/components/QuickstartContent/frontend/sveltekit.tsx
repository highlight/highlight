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

const svelteKitBackendCodeSnippet = `// hooks.server.ts
import { H } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'sveltekit-app',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders('sveltekit.server', event.request.headers, () =>
		resolve(event),
	)
}

export const handleError: HandleServerError = ({ error, event }) => {
	const parsedHeaders = H.parseHeaders(event.request.headers)

	if (error instanceof Error) {
		H.consumeError(
			error,
			parsedHeaders.secureSessionId,
			parsedHeaders.requestId,
		)
	}

	return {
		message: 'Unexpected error',
	}
}
`

const svelteKitBackendInstrumentationSnippet = {
	title: 'Instrument your SvelteKit backend.',
	content:
		'SvelteKit browser instrumentation belongs in `hooks.client.ts`; server instrumentation belongs in `hooks.server.ts`. ' +
		'Setting `tracingOrigins: true` in your frontend setup lets Highlight send headers that `@highlight-run/node` can parse to connect backend traces and errors to frontend sessions.\n\n' +
		'Install both packages, initialize the Node SDK in `hooks.server.ts`, wrap server requests with `H.runWithHeaders`, and report server errors from `handleError`.',
	code: [
		{
			key: 'npm',
			text: `# with npm
npm install highlight.run @highlight-run/node`,
			language: 'bash',
		},
		{
			key: 'pnpm',
			text: `# with pnpm
pnpm add highlight.run @highlight-run/node`,
			language: 'bash',
		},
		{
			key: 'yarn',
			text: `# with yarn
yarn add highlight.run @highlight-run/node`,
			language: 'bash',
		},
		{
			text: svelteKitBackendCodeSnippet,
			language: 'ts',
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
		svelteKitBackendInstrumentationSnippet,
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
	],
}

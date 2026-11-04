import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	setupBackendSnippet,
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

const svelteKitBackendCodeSnippet = `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { H } from '@highlight-run/node';

const highlightOptions = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	serviceVersion: 'git-sha',
	environment: 'production',
};

H.init(highlightOptions);

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers);

	return await H.runWithHeaders(headers, async () => {
		return await resolve(event);
	});
};

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers);
	const parsed = H.parseHeaders(headers);

	if (error instanceof Error) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId);
	} else {
		H.consumeError(
			new Error(\`Unhandled SvelteKit server error: \${JSON.stringify(error)}\`),
			parsed.secureSessionId,
			parsed.requestId,
		);
	}
};
`

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
			title: 'Instrument your SvelteKit server hooks (Backend).',
			content:
				'Install `@highlight-run/node` and configure `src/hooks.server.ts` (or `src/hooks.server.js`) using SvelteKit\'s `handle` and `handleError` hooks. ' +
				'Using `H.runWithHeaders` and `H.parseHeaders` automatically correlates server-side errors, logs, and traces with the frontend session replay.',
			code: [
				{
					key: 'npm',
					text: 'npm install @highlight-run/node',
					language: 'bash',
				},
				{
					key: 'hooks.server.ts',
					text: svelteKitBackendCodeSnippet,
					language: 'ts',
				},
			],
		},
		setupBackendSnippet,
	],
}

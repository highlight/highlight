import {
	backendInstrumentationLink,
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

const svelteKitServerInitCodeSnippet = `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
});

export const handle: Handle = async ({ event, resolve }) => {
	return await H.runWithHeaders(event.request.headers, async () => {
		return await resolve(event);
	});
};

export const handleError: HandleServerError = ({ error, event }) => {
	const { secureSessionId, requestId } = H.parseHeaders(event.request.headers);
	H.consumeError(error, secureSessionId, requestId);

	return {
		message: 'Internal Server Error',
	};
};`

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
			title: 'Instrument your backend.',
			content: `Initialize Highlight in \`hooks.server.ts\` and wrap your SvelteKit \`handle\` function with \`H.runWithHeaders\` to associate backend traces and errors with frontend sessions. You can find more details in our [backend instrumentation](${backendInstrumentationLink}) docs.`,
			code: [
				{
					language: 'ts',
					text: svelteKitServerInitCodeSnippet,
				},
			],
		},
	],
}

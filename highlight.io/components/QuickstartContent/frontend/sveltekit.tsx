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
				'For a SvelteKit application deployed to a Node.js runtime, such as with `@sveltejs/adapter-node`, install the Highlight Node.js SDK. ' +
				'The example below reports unexpected server errors; it does not configure automatic request tracing. ' +
				'Do not use this Node.js setup for edge or worker runtimes. A fully static deployment has no SvelteKit server to instrument.',
			code: [
				{
					language: 'bash',
					text: 'npm install @highlight-run/node',
				},
			],
		},
		{
			title: 'Report unexpected server errors.',
			content:
				'Initialize the backend SDK at module scope in `src/hooks.server.ts`, using the same project ID as your frontend. ' +
				'Export a SvelteKit `handleError` hook to report unexpected errors from server routes, server load functions, and actions. ' +
				'Read `x-highlight-request` from the incoming request to associate the error with its browser session when available. ' +
				'If you already export `handleError`, merge this reporting logic into it and preserve its existing return value. ' +
				'Keep the Node.js SDK out of client hooks and shared modules imported by browser code.',
			code: [
				{
					language: 'ts',
					text: `// src/hooks.server.ts
import { H } from '@highlight-run/node';
import type { HandleServerError } from '@sveltejs/kit';

H.init({
    projectID: '<YOUR_PROJECT_ID>',
    serviceName: 'sveltekit-backend',
    environment: 'production',
});

export const handleError: HandleServerError = ({ error, event }) => {
    const [secureSessionId, requestId] = (
        event.request.headers.get('x-highlight-request') ?? ''
    ).split('/');

    H.consumeError(
        error instanceof Error ? error : new Error(String(error)),
        secureSessionId || undefined,
        requestId || undefined,
    );

    return { message: 'An unexpected error occurred.' };
};`,
				},
			],
		},
		{
			title: 'Verify backend error reporting.',
			content:
				'Temporarily add the endpoint below and request `/api/highlight-test`. Confirm that the response is HTTP 500 and that ' +
				'`Highlight SvelteKit backend test` appears in your Highlight project under Errors. ' +
				'To verify session association, call `fetch("/api/highlight-test")` from your instrumented browser application after the frontend SDK initializes, ' +
				'and confirm that the request includes `x-highlight-request`. A direct navigation or curl request can report an error without a browser session. ' +
				'Remove the test endpoint after verification.\n\n' +
				'If no error appears, check the project ID, runtime, and server connectivity, and allow time for telemetry export before stopping the server. ' +
				'SvelteKit does not call `handleError` for expected errors created with its `error()` helper or for errors your application catches. ' +
				'Report caught exceptions explicitly with `H.consumeError` when needed, but avoid reporting the same exception again in `handleError`. ' +
				'If session association is missing, check your frontend `tracingOrigins` configuration and whether a proxy strips the header. ' +
				'For cross-origin requests, the destination must also allow `x-highlight-request` through CORS; only enable tracing for trusted backend origins.',
			code: [
				{
					language: 'ts',
					text: `// src/routes/api/highlight-test/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
    throw new Error('Highlight SvelteKit backend test');
};`,
				},
			],
		},
		setupBackendSnippet,
	],
}

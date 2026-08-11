import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	verifySnippet,
} from './shared-snippets'
import { verifyTraces } from '../server/shared-snippets-tracing'

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

const svelteKitServerHooksCodeSnippet = `// src/hooks.server.ts
import { H } from '@highlight-run/node';

const headersToObject = (headers: Headers) =>
	Object.fromEntries(headers.entries());

if (!H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-backend',
		environment: 'production',
	});
}

export const handle = async ({ event, resolve }) => {
	return H.runWithHeaders(headersToObject(event.request.headers), async () => {
		return resolve(event);
	});
};

export const handleError = ({ error, event }) => {
	const parsed = H.parseHeaders(headersToObject(event.request.headers));

	if (parsed !== undefined) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId, {
			route: event.route.id ?? 'unknown',
			url: event.url.pathname,
		});
	}

	console.error(error);
};
`

const svelteKitServerRouteCodeSnippet = `// src/routes/api/demo/+server.ts
import { H } from '@highlight-run/node';
import { json } from '@sveltejs/kit';

export const GET = async ({ request }) => {
	const headers = Object.fromEntries(request.headers.entries());

	return H.runWithHeaders(headers, async () => {
		const { span } = H.startWithHeaders('GET /api/demo', headers);

		try {
			console.info('handling /api/demo');
			return json({ ok: true });
		} finally {
			span.end();
		}
	});
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
			title: 'Install the backend SDK.',
			content:
				'Install the `@highlight-run/node` package so server-side requests, logs, and errors can be tied back to the originating Highlight session.',
			code: [
				{
					language: 'bash',
					text: `npm install --save @highlight-run/node`,
				},
			],
		},
		{
			title: 'Initialize the server SDK in `hooks.server.ts`.',
			content:
				'Initialize the Node.js SDK once, wrap incoming requests with `H.runWithHeaders()`, and forward unhandled server errors through `handleError` so Highlight can associate them with the current frontend session.',
			code: [
				{
					language: 'ts',
					text: svelteKitServerHooksCodeSnippet,
				},
			],
		},
		{
			title: 'Create spans inside `+server.ts` routes or form actions.',
			content:
				'For request-level tracing, start spans inside the server code that does the work. The request context created in `handle` lets Highlight relate spans, logs, and captured errors to the same session.',
			code: [
				{
					language: 'ts',
					text: svelteKitServerRouteCodeSnippet,
				},
			],
		},
		verifyTraces,
	],
}

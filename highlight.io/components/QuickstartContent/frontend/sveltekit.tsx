import { siteUrl } from '../../../utils/urls'
import { QuickStartContent, QuickStartStep } from '../QuickstartContent'

import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	verifySnippet,
} from './shared-snippets'

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

export const svelteKitBackendSteps: QuickStartStep[] = [
	{
		title: 'Install the Highlight Node.js SDK for your backend.',
		content:
			'Install the `@highlight-run/node` npm package to instrument your SvelteKit server. ' +
			'This package runs in Node.js only, so only import it from server-only files such as `src/hooks.server.ts`.',
		code: [
			{
				key: 'yarn',
				text: `# with yarn
yarn add @highlight-run/node`,
				language: 'bash',
			},
			{
				key: 'pnpm',
				text: `# with pnpm
pnpm add @highlight-run/node`,
				language: 'bash',
			},
			{
				key: 'npm',
				text: `# with npm
npm install --save @highlight-run/node`,
				language: 'bash',
			},
		],
	},
	{
		title: 'Configure your server-only project ID.',
		content:
			'Keep your Highlight project ID in a server-only environment variable so it is never bundled for the browser. ' +
			'Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), set `HIGHLIGHT_PROJECT_ID` in your server or hosting provider environment, and read it with `$env/dynamic/private` (or `$env/static/private`). ' +
			'Do not use a `PUBLIC_` prefixed variable for backend initialization.',
		code: [
			{
				key: 'env',
				text: `# .env (read with $env/dynamic/private, never prefix with PUBLIC_)
HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>`,
				language: 'bash',
			},
		],
	},
	{
		title: 'Instrument your SvelteKit server.',
		content:
			'Initialize the Node.js SDK in `src/hooks.server.ts` and wrap every request with `H.runWithHeaders` so backend errors, logs, and traces are tied to the frontend session that made the request. ' +
			'Your frontend `tracingOrigins` and `networkRecording` settings send the `x-highlight-request` header that `H.parseHeaders` reads on the server, and `handleError` catches unhandled errors from load functions, actions, and endpoints. ' +
			'You can find more details about this file in the SvelteKit docs [here](https://kit.svelte.dev/docs/hooks).',
		code: [
			{
				key: 'hooks-server',
				text: `// src/hooks.server.ts
import { H } from '@highlight-run/node';
import { env } from '$env/dynamic/private';
import type { Handle, HandleServerError } from '@sveltejs/kit';

H.init({
	projectID: env.HIGHLIGHT_PROJECT_ID,
	serviceName: '<YOUR_SERVICE_NAME>',
	environment: 'production',
});

export const handle: Handle = async ({ event, resolve }) => {
	return await H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		event.request.headers,
		() => resolve(event),
	);
};

export const handleError: HandleServerError = async ({ error, event }) => {
	console.error(error);

	if (error instanceof Error && event) {
		const parsed = H.parseHeaders(event.request.headers);
		H.consumeError(error, parsed.secureSessionId, parsed.requestId);
	}
};`,
				language: 'js',
			},
		],
	},
	{
		title: 'Report errors you handle yourself.',
		content:
			'Errors that reach `handleError` are reported automatically. If you catch an exception before that (for example when a `+server.ts` endpoint returns a graceful error response instead of crashing the request), report it with `H.parseHeaders` and `H.consumeError` so it still shows up in Highlight with the session and request attached.',
		code: [
			{
				key: 'report-error',
				text: `// src/routes/api/things/+server.ts
import { H } from '@highlight-run/node';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	try {
		// ... do something that can fail ...
		throw new Error('example server error!');
	} catch (error) {
		if (error instanceof Error) {
			const parsed = H.parseHeaders(request.headers);
			H.consumeError(error, parsed.secureSessionId, parsed.requestId);
		}

		return new Response('Internal Server Error', { status: 500 });
	}
};`,
				language: 'js',
			},
		],
	},
	{
		title: 'Use server logging and custom spans.',
		content:
			'Once `H.init` has run, logs from the built-in `console` methods on the server are recorded automatically. ' +
			'Use `H.startWithHeaders` to record a custom span for interesting work, and `H.log` with the ids from `H.parseHeaders` to link a log to the session and request that produced it.',
		code: [
			{
				key: 'logging-spans',
				text: `// src/routes/+page.server.ts (also works in actions and +server.ts endpoints)
import { H } from '@highlight-run/node';

export async function load(event) {
	console.info('handling request', { url: event.url.pathname });

	const { span } = H.startWithHeaders(
		'my-custom-operation',
		event.request.headers,
	);
	// ... do interesting work ...
	span.end();

	const parsed = H.parseHeaders(event.request.headers);
	H.log(
		'finished custom work',
		'info',
		parsed.secureSessionId,
		parsed.requestId,
	);

	return { ok: true };
}`,
				language: 'js',
			},
		],
	},
	{
		title: 'Verify your backend instrumentation.',
		content:
			'Throw an exception from one of your server handlers (or trigger an unexpected server error) and check that it shows up on the [errors page](https://app.highlight.io/errors) with the matching session and trace. ' +
			`Read more about backend error monitoring in our [Node.js SDK reference](${siteUrl(
				'/docs/sdk/nodejs',
			)}) and [JS server overview](${siteUrl(
				'/docs/getting-started/server/js/overview',
			)}).`,
	},
]

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
		...svelteKitBackendSteps,
	],
}

import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	setupBackendSnippet,
	verifySnippet,
	backendInstrumentationLink,
} from './shared-snippets'
import { QuickStartContent } from '../QuickstartContent'

const svelteKitPackageInstallSnippet = {
	...packageInstallSnippet,
	title: 'Install the npm packages & SDKs.',
	content: 'Install the \highlight.run\ client package and \@highlight-run/node\ server package.',
	code: [
		{
			key: 'yarn',
			text: '# with yarn\nyarn add highlight.run @highlight-run/node',
			language: 'bash',
		},
		{
			key: 'pnpm',
			text: '# with pnpm\npnpm add highlight.run @highlight-run/node',
			language: 'bash',
		},
		{
			key: 'npm',
			text: '# with npm\nnpm install highlight.run @highlight-run/node',
			language: 'bash',
		},
	],
}

const svelteKitInitCodeSnippet = \// hooks.client.ts
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
...\

const svelteKitBackendInstrumentationCodeSnippet = \// hooks.server.ts
import { H } from '@highlight-run/node';
import type { Handle, HandleServerError } from '@sveltejs/kit';

if (!H.isInitialized()) {
	H.init({
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-sveltekit-backend',
		environment: 'production',
	});
}

export const handle: Handle = async ({ event, resolve }) => {
	return H.runWithHeaders(
		'sveltekit-request',
		Object.fromEntries(event.request.headers),
		() => resolve(event),
	);
};

export const handleError: HandleServerError = ({ error, event }) => {
	const parsed = H.parseHeaders(Object.fromEntries(event.request.headers));

	if (error instanceof Error) {
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId);
	} else {
		H.consumeError(
			new Error(String(error)),
			parsed?.secureSessionId,
			parsed?.requestId,
		);
	}
};
\

const svelteKitBackendInstrumentationSnippet = {
	title: 'Instrument your SvelteKit backend.',
	content:
		'Create or update \hooks.server.ts\ to initialize \@highlight-run/node\, preserve request context, and report unexpected server errors. If you already export a \handle\ hook, wrap your existing logic with \H.runWithHeaders\. The \	racingOrigins\ and \
etworkRecording\ client options above send the \x-highlight-request\ header, and the server hook uses that header to associate backend errors with frontend sessions. For more details, read the [backend instrumentation](' +
		backendInstrumentationLink +
		') section.',
	code: [
		{
			language: 'ts',
			text: svelteKitBackendInstrumentationCodeSnippet,
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
		svelteKitPackageInstallSnippet,
		{
			...initializeSnippet,
			content:
				'In SvelteKit, we recommend initializing highlight.io in the \hooks.client.js\ or \hooks.client.ts\ file. You can find more details about this file in the SvelteKit docs [here](https://kit.svelte.dev/docs/hooks). To get started, we recommend setting \	racingOrigins\ and \
etworkRecording\ so that we can pass a header to pair frontend and backend errors. \n\n\n' +
				\Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as pass it as the first parameter of the \H.init()\ method.\,
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
				'Update your \svelte.config.js\ to disable relative paths. ' +
				'[See the SvelteKit docs here for more details](https://kit.svelte.dev/docs/configuration#paths).',
			code: [
				{
					language: 'js',
					text: "/** @type {import('@sveltejs/kit').Config} *\/\nconst config = {\n\tkit: {\n\t\tpaths: {\n\t\t\trelative: false\n\t\t}\n\t}\n};\nexport default config;",
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		svelteKitBackendInstrumentationSnippet,
	],
}
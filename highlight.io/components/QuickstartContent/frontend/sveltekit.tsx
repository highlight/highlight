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

const svelteKitBackendInstallSnippet = {
	title: 'Install the server SDK.',
	content:
		'To instrument your SvelteKit backend on Node.js, install `@highlight-run/node`.',
	code: [
		{
			key: 'npm',
			text: `# with npm
npm install @highlight-run/node`,
			language: 'bash',
		},
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
	],
}

const svelteKitBackendInstrumentationSnippet = {
	title: 'Instrument your SvelteKit backend.',
	content:
		'Initialize the Node.js SDK in `hooks.server.ts` and wrap your `handle` hook with `H.runWithHeaders()` so Highlight can correlate backend errors/logs/traces with frontend sessions.\n\n' +
		'If you are deploying to an edge/worker runtime (e.g. Cloudflare Workers), use the appropriate SDK for that runtime instead of `@highlight-run/node`.',
	code: [
		{
			language: 'ts',
			text: `// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H, type NodeOptions } from '@highlight-run/node'

const highlightConfig: NodeOptions = {
	projectID: process.env.HIGHLIGHT_PROJECT_ID ?? '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: process.env.NODE_ENV,
}

if (!H.isInitialized()) {
	H.init(highlightConfig)
}

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	return await H.runWithHeaders(headers, async () => resolve(event))
}

export const handleError: HandleServerError = ({ error, event }) => {
	const headers = Object.fromEntries(event.request.headers.entries())
	const parsed = H.parseHeaders(headers)
	if (parsed) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	} else {
		H.consumeError(error)
	}
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
		svelteKitBackendInstallSnippet,
		svelteKitBackendInstrumentationSnippet,
		verifySnippet,
		configureSourcemapsCI(),
	],
}

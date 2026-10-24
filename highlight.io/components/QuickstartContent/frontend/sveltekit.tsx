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

const svelteKitServerInitCodeSnippet = `// hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { H } from '@highlight-run/node'

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-sveltekit-backend',
	environment: 'production',
})

export const handle: Handle = async ({ event, resolve }) => {
	const headers = Object.fromEntries(event.request.headers)

	return H.runWithHeaders(
		\`\${event.request.method} \${event.url.pathname}\`,
		headers,
		async () => resolve(event),
	)
}

export const handleError: HandleServerError = async ({ error, event }) => {
	const parsed = H.parseHeaders(Object.fromEntries(event.request.headers))
	const normalizedError =
		error instanceof Error ? error : new Error(String(error))

	H.consumeError(normalizedError, parsed.secureSessionId, parsed.requestId)
	await H.flush()
}
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
		{
			title: 'Instrument your SvelteKit backend.',
			content:
				'Install `@highlight-run/node` and initialize it from `hooks.server.ts` to capture server-side errors, logs, and request traces. The `tracingOrigins` option configured in `hooks.client.ts` forwards Highlight request headers, and `H.runWithHeaders` uses those headers to associate backend errors with the frontend session.',
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
npm install @highlight-run/node`,
					language: 'bash',
				},
				{
					text: svelteKitServerInitCodeSnippet,
					language: 'ts',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
	],
}

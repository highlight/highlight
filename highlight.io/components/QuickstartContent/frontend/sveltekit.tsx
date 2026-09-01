import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const GUIDE_URL = siteUrl('/docs/getting-started/fullstack-frameworks/sveltekit')

const svelteKitInitCodeSnippet = `// src/hooks.client.ts
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

const svelteKitServerCodeSnippet = `// src/hooks.server.ts
import { H, type NodeOptions } from '@highlight-run/node'
import type { Handle, HandleServerError } from '@sveltejs/kit'

const highlightConfig: NodeOptions = {
\tprojectID: '<YOUR_PROJECT_ID>',
\tserviceName: 'my-sveltekit-backend',
\tenvironment: 'production',
}

if (!H.isInitialized()) {
\tH.init(highlightConfig)
}

export const handle: Handle = async ({ event, resolve }) => {
\treturn H.runWithHeaders(
\t\t\`\${event.request.method} \${event.url.pathname}\`,
\t\tevent.request.headers,
\t\t() => resolve(event),
\t\t{
\t\t\tattributes: {
\t\t\t\troute: event.route.id ?? event.url.pathname,
\t\t\t},
\t\t},
\t)
}

export const handleError: HandleServerError = async ({
\terror,
\tevent,
\tstatus,
\tmessage,
}) => {
\tconst { secureSessionId, requestId } = H.parseHeaders(event.request.headers)
\tconst reportedError =
\t\terror instanceof Error ? error : new Error(message)

\tH.consumeError(reportedError, secureSessionId, requestId, {
\t\troute: event.route.id ?? event.url.pathname,
\t\tstatus,
\t})
}
`

export const SvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io with your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Sessions', 'Errors', 'Logs', 'Traces'],
	entries: [
		{
			title: 'Install the client and server SDKs.',
			content:
				'Install `highlight.run` for the browser side of your app, plus `@highlight-run/node` for the SvelteKit server runtime.',
			code: [
				{
					key: 'npm',
					text: `npm install highlight.run @highlight-run/node`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `yarn add highlight.run @highlight-run/node`,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `pnpm add highlight.run @highlight-run/node`,
					language: 'bash',
				},
			],
		},
		{
			...initializeSnippet,
			content:
				'In SvelteKit, we recommend initializing highlight.io in `src/hooks.client.js` or `src/hooks.client.ts`. You can find more details about this file in the SvelteKit docs [here](https://kit.svelte.dev/docs/hooks). To get started, we recommend setting `tracingOrigins` and `networkRecording` so that we can pass a header to pair frontend and backend errors. \n\n\n' +
				`Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method.`,
			code: [
				{
					...(initializeSnippet.code?.[0] ?? {}),
					text: svelteKitInitCodeSnippet,
					language: initializeSnippet.code?.[0]?.language ?? 'js',
				},
			],
		},
		{
			title: 'Instrument the SvelteKit server.',
			content:
				'If your app has a real server runtime, add Highlight to `src/hooks.server.ts` so each request carries the frontend session context into server logs, errors, and traces. If you are fully static with `adapter-static`, you can skip this step.',
			code: [
				{
					language: 'ts',
					text: svelteKitServerCodeSnippet,
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
			title: 'More SvelteKit setup details?',
			content: `See our [full SvelteKit guide](${GUIDE_URL}) for a longer walkthrough, troubleshooting tips, and a few notes on how to fit Highlight into an existing \`hooks.server.ts\` file.`,
		},
	],
}

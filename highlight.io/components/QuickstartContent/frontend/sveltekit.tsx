import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'
import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

const svelteKitInitCodeSnippet = `// hooks.client.ts
...

import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    environment: 'production',
    version: 'commit:abcdefg12345',
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
        urlBlocklist: [
            // insert urls you don't want to record here
        ],
	},
});
...
`

export const SvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io with your SvelteKit application.',
	logoUrl: siteUrl('/images/quickstart/sveltekit.svg'),
	entries: [
		packageInstallSnippet,
		{
			...initializeSnippet,
			content:
				'In SvelteKit, we recommend initializing highlight.io in the `hooks.client.js` or `hooks.client.ts` file. You can find more details about this file in the SvelteKit docs [here](https://kit.svelte.dev/docs/hooks). To get started, we recommend setting `tracingOrigins` and `networkRecording` so that we can pass a header to pair frontend and backend errors. \n\n\n' +
				`Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup) and insert it in place of \`<YOUR_PROJECT_ID>\` in the code snippet to the right.`,
			code: {
				...initializeSnippet.code,
				text: svelteKitInitCodeSnippet,
				language: initializeSnippet.code?.language ?? 'js',
			},
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}

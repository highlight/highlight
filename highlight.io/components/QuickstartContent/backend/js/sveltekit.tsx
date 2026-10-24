import {
	initializeSnippet,
	packageInstallSnippet,
	verifySnippet,
} from './shared-snippets'

import { QuickStartContent } from '../../QuickstartContent'

const svelteKitServerInitCodeSnippet = `// hooks.server.ts
import { H } from '@highlight-run/node';
import type { Handle, HandleServerError } from '@sveltejs/kit';

H.init({ projectID: '<YOUR_PROJECT_ID>' });

export const handle: Handle = async ({ event, resolve }) => {
    return await H.runWithHeaders(event.request.headers, async () => {
        return await resolve(event);
    });
};

export const handleError: HandleServerError = ({ error, event }) => {
    const { secureSessionId, requestId } = H.parseHeaders(event.request.headers);
    H.consumeError(error as Error, secureSessionId, requestId);
};
`

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io on the backend of your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		{
			...packageInstallSnippet,
			code: [
				{
					text: 'npm install @highlight-run/node',
					language: 'bash',
				},
			],
		},
		{
			...initializeSnippet,
			content:
				'In SvelteKit, we recommend initializing highlight.io in the `hooks.server.js` or `hooks.server.ts` file. You can find more details about this file in the SvelteKit docs [here](https://kit.svelte.dev/docs/hooks). \n\n\n' +
				`Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method.`,
			code: [
				{
					text: svelteKitServerInitCodeSnippet,
					language: 'ts',
				},
			],
		},
		verifySnippet,
	],
}

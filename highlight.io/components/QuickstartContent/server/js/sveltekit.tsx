import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { svelteKitBackendSteps } from '../../frontend/sveltekit'

export const JSSvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io backend instrumentation in your SvelteKit application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		{
			title: 'Set up the SvelteKit browser SDK first.',
			content:
				'Backend errors, logs, and traces are tied to a session by the `x-highlight-request` header that the browser SDK sends. ' +
				`Follow the [SvelteKit quickstart](${siteUrl(
					'/docs/getting-started/browser/sveltekit',
				)}) to install \`highlight.run\`, initialize \`H.init()\` in your \`hooks.client.ts\`, and enable \`tracingOrigins\` and \`networkRecording\`.`,
		},
		...svelteKitBackendSteps,
	],
}

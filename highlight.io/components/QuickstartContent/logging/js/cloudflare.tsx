import { QuickStartContent } from '../../QuickstartContent'
import { tsconfig } from '../../shared-snippets'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSCloudflareLoggingContent: QuickStartContent = {
	title: 'Logging in Cloudflare Workers',
	subtitle:
		'Learn how to set up highlight.io log ingestion in Cloudflare Workers.',
	entries: [
		previousInstallSnippet('cloudflare'),
		{
			title: `Add the Cloudflare Worker Highlight integration.`,
			content:
				'All you need to start recording your console methods is call `H.init`. ' +
				'All Highlight data submission uses [waitUntil](https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#waituntil) to make sure that we have no impact on request handling performance.',
			code: [
				{
					text: `import { H } from '@highlight-run/cloudflare'

export default {
  async fetch(request: Request, env: {}, ctx: ExecutionContext) {
    H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
    console.log('starting some work...')
    // ...
  },
}`,
					language: `js`,
				},
			],
		},
		tsconfig,
		verifyLogs,
	],
}

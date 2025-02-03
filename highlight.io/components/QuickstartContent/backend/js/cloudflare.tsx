import { QuickStartContent } from '../../QuickstartContent'
import { tsconfig } from '../../shared-snippets'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSCloudflareContent: QuickStartContent = {
	title: 'Cloudflare Workers',
	subtitle: 'Learn how to set up highlight.io in Cloudflare Workers.',
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['cloudflare']),
		{
			title: `Add the Cloudflare Worker Highlight integration.`,
			content:
				addIntegrationContent('Cloudflare Worker SDK', 'cloudflare') +
				' ' +
				'The `sendResponse` method traces successful requests while `consumeError` reports exceptions. ' +
				'All Highlight data submission uses [waitUntil](https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#waituntil) to make sure that we have no impact on request handling performance.',
			code: [
				{
					text: `import { H } from '@highlight-run/cloudflare'

async function doRequest() {
  return new Response('hello!')
}

export default {
  async fetch(request: Request, env: {}, ctx: ExecutionContext) {
    H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
    console.log('starting some work...')
    try {
      const response = await doRequest()
      H.sendResponse(response)
      return response
    } catch (e: any) {
      H.consumeError(e)
      throw e
    }
  },
}`,
					language: `js`,
				},
			],
		},
		verifyError(
			'cloudflare',
			`export default {
  async fetch(request: Request, env: {}, ctx: ExecutionContext) {
    H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
    H.consumeError(new Error('example error!'))
  },
}`,
		),
		tsconfig,
		setupLogging('cloudflare'),
	],
}

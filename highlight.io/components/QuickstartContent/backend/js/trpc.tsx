import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JStRPCContent: QuickStartContent = {
	title: 'tRPC',
	subtitle: 'Learn how to set up highlight.io in tRPC.',
	logoUrl: siteUrl('/images/quickstart/javascript.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the tRPC Highlight integration.',
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `import { createNextApiHandler } from '@trpc/server/adapters/next'
import { Handlers } from '@highlight-run/node'

export default createNextApiHandler({
  // ... your config
  onError: ({ error, req }) => {
    // ... your own error handling logic here
    Handlers.trpcOnError(
			{ error, req },
			{
				projectID: '<YOUR_PROJECT_ID>',
				serviceName: 'my-trpc-app',
				serviceVersion: 'git-sha',
				environment: 'production'
			}
		)
  },
})
`,
					language: 'js',
				},
			],
		},
		verifyError('tRPC'),
		setupLogging('trpc'),
	],
}

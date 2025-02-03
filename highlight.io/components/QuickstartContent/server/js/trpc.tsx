import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	verifyError,
} from './shared-snippets-monitoring'

export const JStRPCReorganizedContent: QuickStartContent = {
	title: 'tRPC',
	subtitle: 'Learn how to set up highlight.io in tRPC.',
	logoKey: 'javascript',
	products: ['Errors', 'Logs', 'Traces'],
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
		verifyLogs,
		verifyTraces,
	],
}

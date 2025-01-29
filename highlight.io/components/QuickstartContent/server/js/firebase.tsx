import { siteUrl } from '../../../../utils/urls'
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

export const JSFirebaseReorganizedContent: QuickStartContent = {
	title: 'Firebase',
	subtitle: 'Learn how to set up highlight.io in Firebase Cloud Functions.',
	logoUrl: siteUrl('/images/quickstart/firebase.svg'),
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: `Add the Firebase Highlight integration.`,
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `const highlightNode = require('@highlight-run/node')

// Callable function wrapper
exports.exampleCallable = functions.https.onCall(
  highlightNode.Handlers.firebaseCallableFunctionHandler(
    (data, context) => {
      // ... your handler code here
      return { result: 'useful result!' }
    },
    {
			projectID: '<YOUR_PROJECT_ID>',
			serviceName: 'my-firebase-app',
			serviceVersion: 'git-sha',
			environment: 'production'
		},
  ),
)

// Http function wrapper
exports.exampleHttp = functions.https.onRequest(
  highlightNode.Handlers.firebaseHttpFunctionHandler(
    (req, res) => {
      // ... your handler code here
      res.json({ result: 'useful result!' })
    },
    { projectID: '<YOUR_PROJECT_ID>' },
  ),
)`,
					language: `js`,
				},
			],
		},
		verifyError(
			'Firebase',
			`exports.exampleCallable = functions.https.onCall(
  highlightNode.Handlers.firebaseCallableFunctionHandler(
    (data, context) => {
      throw new Error('example error!')
      return { result: 'useful result!' }
    },
    {
			projectID: '<YOUR_PROJECT_ID>',
			serviceName: 'my-firebase-app',
			serviceVersion: 'git-sha',
			environment: 'production'
		},
  ),
)`,
		),
		verifyLogs,
		verifyTraces,
	],
}

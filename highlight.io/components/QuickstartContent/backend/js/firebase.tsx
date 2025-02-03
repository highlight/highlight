import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSFirebaseContent: QuickStartContent = {
	title: 'Firebase',
	subtitle: 'Learn how to set up highlight.io in Firebase Cloud Functions.',
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
		setupLogging('firebase'),
	],
}

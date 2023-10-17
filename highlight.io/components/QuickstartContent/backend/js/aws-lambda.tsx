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

export const JSAWSLambdaContent: QuickStartContent = {
	title: 'Error Handling from Python AWS Lambda',
	subtitle: 'Learn how to set up highlight.io on AWS Lambda.',
	logoUrl: siteUrl('/images/quickstart/aws-lambda.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the AWS Lambda Node.js Highlight integration.',
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `import type { APIGatewayEvent } from 'aws-lambda'
import { H, Handlers } from '@highlight-run/node'

// setup console log recording
H.init({ projectID: '<YOUR_PROJECT_ID>' })
// wrap your lambda with an error handler
export const handler = Handlers.serverlessFunction(
  (event?: APIGatewayEvent) => {
    console.log('hello, world!', {queryString: event?.queryStringParameters});
    return {statusCode: 200};
  },
  { projectID: '<YOUR_PROJECT_ID>', serviceName: 'my-lambda-function', serviceVersion: 'git-sha' },
)
`,
					language: 'js',
				},
			],
		},
		verifyError('AWS Lambda'),
		setupLogging('aws'),
	],
}

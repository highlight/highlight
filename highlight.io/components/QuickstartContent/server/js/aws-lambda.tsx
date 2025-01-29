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

export const JSAWSLambdaReorganizedContent: QuickStartContent = {
	title: 'Javascript AWS Lambda',
	subtitle: 'Learn how to set up highlight.io on AWS Lambda.',
	logoUrl: siteUrl('/images/quickstart/aws-lambda.svg'),
	products: ['Errors', 'Logs', 'Traces'],
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
  {
		projectID: '<YOUR_PROJECT_ID>',
		serviceName: 'my-lambda-function',
		serviceVersion: 'git-sha',
		environment: 'production',
	},
)
`,
					language: 'js',
				},
			],
		},
		verifyError('AWS Lambda'),
		verifyLogs,
		verifyTraces,
	],
}

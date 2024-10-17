import { siteUrl } from '../../../../utils/urls'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
} from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonAWSTracesContent: QuickStartContent = {
	title: 'Python AWS Lambda',
	subtitle: 'Learn how to set up highlight.io tracing for on AWS Lambda.',
	logoUrl: siteUrl('/images/quickstart/aws-lambda.svg'),
	entries: [
		setupFrontendSnippet,
		{
			title: `Optionally, set up OTel auto-instrumentation.`,
			content: `Follow [the instructions](${siteUrl(
				'/docs/getting-started/backend-tracing/serverless/aws-lambda',
			)}) for setting up AWS Lambda auto-instrumentation. This is not required, but can be used independently or alongside manual instrumentation (documented below).`,
		},
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK. Add the `@observe_handler` decorator to your lambdas.',
			code: [
				{
					text: `import highlight_io
from highlight_io.integrations.aws import observe_handler

${init}


@observe_handler
def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": f"Hello, {name}. This HTTP triggered function executed successfully.",
    }
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Hit your Lambda function.',
			content:
				'Setup an HTTP trigger and visiting your Lambda on the internet.',
		},
		verifyTraces,
	],
}

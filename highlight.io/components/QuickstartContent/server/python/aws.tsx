import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { downloadSnippet, init } from './shared-snippets-monitoring'

export const PythonAWSReorganizedContext: QuickStartContent = {
	title: 'Python AWS Lambda',
	subtitle: 'Learn how to set up highlight.io on AWS Lambda.',
	logoKey: 'awslambda',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
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
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add an operation that raises an exception to your lambda handler. ' +
				'Setup an HTTP trigger and visit your lambda on the internet. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import highlight_io
from highlight_io.integrations.aws import observe_handler

${init}


@observe_handler
def lambda_handler(event, context):
    return {
        "body": f"Returning this is a bad idea: {5 / 0}.",
    }`,
					language: 'python',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}

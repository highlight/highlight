import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { downloadSnippet, init } from './shared-snippets-monitoring'

export const PythonGCPReorganizedContext: QuickStartContent = {
	title: 'Python Google Cloud Functions',
	subtitle: 'Learn how to set up highlight.io on Google Cloud Functions.',
	logoKey: 'googlecloud',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK. Add the `@observe_handler` decorator to your functions.',
			code: [
				{
					text: `import logging
import random
from datetime import datetime

import functions_framework

import highlight_io
from highlight_io.integrations.gcp import observe_handler

${init}


@observe_handler
@functions_framework.http
def hello_http(request):
    return "Hello {}!".format(name)
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add an operation that raises an exception to your function. ' +
				'Setup an HTTP trigger and visit your function on the internet. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random
from datetime import datetime

import functions_framework

import highlight_io
from highlight_io.integrations.gcp import observe_handler

${init}


@observe_handler
@functions_framework.http
def hello_http(request):
    return f"This might be a bad idea: {5/0}"
`,
					language: 'python',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}

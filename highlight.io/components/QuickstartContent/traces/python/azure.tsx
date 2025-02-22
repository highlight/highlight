import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
} from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonAzureTracesContent: QuickStartContent = {
	title: 'Python Azure Functions',
	subtitle: 'Learn how to set up highlight.io tracing with Azure Functions.',
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK. Add the `@observe_handler` decorator to your azure functions.',
			code: [
				{
					text: `import azure.functions as func

import highlight_io
from highlight_io.integrations.azure import observe_handler

${init}


@observe_handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        "This HTTP triggered function executed successfully.",
        status_code=200,
    )
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Hit your Azure function.',
			content:
				'Setup an HTTP trigger and visit your Azure function on the internet.',
		},
		verifyTraces,
	],
}

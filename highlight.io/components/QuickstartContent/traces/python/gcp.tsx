import { siteUrl } from '../../../../utils/urls'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
} from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonGCPTracesContent: QuickStartContent = {
	title: 'Python Google Cloud Functions',
	subtitle:
		'Learn how to set up highlight.io tracing on Google Cloud Functions.',
	logoUrl: siteUrl('/images/quickstart/google-cloud.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK. Add the `@observe_handler` decorator to your functions.',
			code: [
				{
					text: `import functions_framework

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
			title: 'Hit your Google Cloud function.',
			content:
				'Setup an HTTP trigger and visiting your Google Cloud function on the internet.',
		},
		verifyTraces,
	],
}

import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { downloadSnippet, init } from './shared-snippets-monitoring'

export const PythonFastAPIReorganizedContext: QuickStartContent = {
	title: 'Python FastAPI',
	subtitle:
		'Learn how to set up highlight.io on your Python FastAPI backend API.',
	logoUrl: siteUrl('/images/quickstart/fastapi.svg'),
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK to with the FastAPI integration.',
			code: [
				{
					text: `from fastapi import FastAPI, Request

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware

${init}

app = FastAPI()
app.add_middleware(FastAPIMiddleware)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add the following code to your FastAPI app and start the FastAPI server. ' +
				'Visit http://127.0.0.1:5000/hello in your browser. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `from fastapi import FastAPI, Request

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware

${init}

app = FastAPI()
app.add_middleware(FastAPIMiddleware)


@app.get("/")
async def root(request: Request):
    return {"message": f"This might not be a great idea {5 / 0}"}
`,
					language: 'python',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}

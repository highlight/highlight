import { siteUrl } from '../../../../utils/urls'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
} from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonFastAPITracesContent: QuickStartContent = {
	title: 'Python FastAPI',
	subtitle: 'Learn how to set up highlight.io tracing for your FastAPI app.',
	logoUrl: siteUrl('/images/quickstart/fastapi.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK to with the FastAPI integration.',
			code: [
				{
					text: `from fastapi import FastAPI

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
			title: 'Hit your FastAPI app.',
			content:
				'Visit one of your pages in your browser that will make a request to the server.',
			code: [
				{
					text: `from fastapi import Request

@app.get("/")
async def root(request: Request):
    return {"message": "Hello world!"}
`,
					language: 'python',
				},
			],
		},
		verifyTraces,
	],
}

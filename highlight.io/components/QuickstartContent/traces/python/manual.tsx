import { siteUrl } from '../../../../utils/urls'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
} from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonManualTracesContent: QuickStartContent = {
	title: 'Tracing from a Python App',
	subtitle:
		'Learn how to set up highlight.io tracing for your Python application.',
	logoUrl: siteUrl('/images/quickstart/python.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK.',
			code: [
				{
					text: `import highlight_io

${init}`,
					language: 'python',
				},
			],
		},
		{
			title: 'Run your code with the H.trace() wrapper.',
			content: 'Wrap your code with H.trace(), and run your code.',
			code: [
				{
					text: `import logging

def main():
    with H.trace(span_name="my_span"):
        logging.info('hello, world!', {'favorite_number': 7})
        return f"<h1>Hello world</h1>"

if __name__ == "__main__":
    main()`,
					language: 'python',
				},
			],
		},
		verifyTraces,
	],
}

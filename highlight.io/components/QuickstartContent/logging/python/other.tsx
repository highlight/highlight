import { downloadSnippet } from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const PythonOtherLogContent: QuickStartContent = {
	title: 'Logging from a Python App',
	subtitle:
		'Learn how to set up highlight.io Python log ingestion without a logging library.',
	entries: [
		previousInstallSnippet('python'),
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK with `instrument_logging` enabled.',
			code: [
				{
					text: `import highlight_io

H = highlight_io.H("<YOUR_PROJECT_ID>", instrument_logging=True)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Call the built-in Python logging library.',
			content:
				'Logs are reported automatically from the builtin logging methods (as long as `instrument_logging=True` is provided to the `highlight_io.H` constructor). ' +
				'Visit the [highlight logs portal](https://app.highlight.io/logs) and check that backend logs are coming in. ' +
				'Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `import logging

def main():
    logging.info('hello, world!')
    logging.warn('whoa there', {'key': 'value'})
`,
					language: 'python',
				},
			],
		},
		verifyLogs,
	],
}

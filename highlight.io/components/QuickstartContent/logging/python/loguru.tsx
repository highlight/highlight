import { siteUrl } from '../../../../utils/urls'
import { downloadSnippet } from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const PythonLoguruLogContent: QuickStartContent = {
	title: 'Logging from Python with Loguru',
	subtitle: 'Learn how to set up highlight.io with logs from Python Loguru.',
	logoUrl: siteUrl('/images/quickstart/python-loguru.png'),
	entries: [
		previousInstallSnippet('python'),
		downloadSnippet('loguru'),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK with `record_logs` disabled, while passing the highlight logging handler to [loguru](https://github.com/Delgan/loguru#readme).',
			code: {
				text: `import highlight_io
from loguru import logger

H = highlight_io.H("<YOUR_PROJECT_ID>", record_logs=False)

logger.add(
	H.logging_handler,
	format="{message}",
	level="INFO",
	backtrace=True,
)`,
				language: 'python',
			},
		},
		{
			title: 'Use loguru!',
			content:
				'Logs are reported automatically from loguru logging methods. ' +
				'Visit the [highlight logs portal](http://app.highlight.io/logs) and check that backend logs are coming in.',
			code: {
				text: `import highlight_io
from loguru import logger

H = highlight_io.H("<YOUR_PROJECT_ID>", record_logs=False)

logger.add(
	H.logging_handler,
	format="{message}",
	level="INFO",
	backtrace=True,
)

def main():
    logger.debug("That's it, beautiful and simple logging!", {"nice": "one"})
    context_logger = logger.bind(ip="192.168.0.1", user="someone")
	context_logger.info("Contextualize your logger easily")
`,
				language: 'python',
			},
		},
		verifyLogs,
	],
}

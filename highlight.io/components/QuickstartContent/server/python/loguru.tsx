import { siteUrl } from '../../../../utils/urls'
import { downloadSnippet } from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'

export const PythonLoguruLogReorganizedContent: QuickStartContent = {
	title: 'Logging from Python with Loguru',
	subtitle: 'Learn how to set up highlight.io with logs from Python Loguru.',
	logoUrl: siteUrl('/images/quickstart/python-loguru.png'),
	products: ['Logs'],
	entries: [
		frontendInstallSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK with `instrument_logging` disabled, while passing the highlight logging handler to [loguru](https://github.com/Delgan/loguru#readme). ' +
				'`instrument_logging=False` must be passed to make sure the loguru handler does not collide with built-in `logging` instrumentation.',
			code: [
				{
					text: `import highlight_io

H = highlight_io.H("<YOUR_PROJECT_ID>", instrument_logging=False)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Use loguru!',
			content:
				'Logs are reported automatically from loguru logging methods. ' +
				'Visit the [highlight logs portal](https://app.highlight.io/logs) and check that backend logs are coming in.',
			code: [
				{
					text: `import highlight_io
from loguru import logger

H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	instrument_logging=False,
	service_name="my-app",
	service_version="git-sha",
	environment="production",
)

logger.add(
	H.logging_handler,
	format="{message}",
	level="INFO",
	backtrace=True,
	serialize=True,
)

def main():
    logger.debug("That's it, beautiful and simple logging!", nice="one")
    context_logger = logger.bind(ip="192.168.0.1", user="someone")
	context_logger.info("Contextualize your logger easily")
`,
					language: 'python',
				},
			],
		},
		verifyLogs,
	],
}

import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSPinoHTTPJSONLogContent: QuickStartContent = {
	title: 'Logging with Pino.JS',
	subtitle: 'Learn how to set up highlight.io log ingestion for Pino.JS.',
	entries: [
		previousInstallSnippet('nodejs'),
		{
			title: 'Setup the Pino HTTP transport.',
			content:
				'The Pino HTTP transport will send JSON logs to highlight.io. ' +
				'Make sure to set the `project` and `service` query string parameters.',
			code: [
				{
					text: `import { createWriteStream } from 'pino-http-send'
import pino from 'pino'


const stream = createWriteStream({
  // set your project ID and service name in the query string
  url: 'https://pub.highlight.io/v1/logs/json?project=<YOUR_PROJECT_ID>&service=EXAMPLE_NODEJS_PINO_SERVICE',
})

const logger = pino({ level: 'info' }, stream)

logger.info({ key: 'my-value' }, 'hello, highlight.io!')`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}

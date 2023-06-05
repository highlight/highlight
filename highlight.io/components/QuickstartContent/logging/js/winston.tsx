import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSWinstonHTTPJSONLogContent: QuickStartContent = {
	title: 'Logging with Winston.JS',
	subtitle: 'Learn how to set up highlight.io log ingestion for Winston JS.',
	entries: [
		previousInstallSnippet('nodejs'),
		{
			title: 'Setup the Winston HTTP transport.',
			content:
				'The Winston HTTP transport will send JSON logs to highlight.io',
			code: {
				text: `import {createLogger, format, transports} from 'winston';


const highlightTransport = new transports.Http({
    host: 'pub.highlight.run',
    path: "/v1/logs/json",
    ssl: true,
    headers: {
        'x-highlight-project': 'YOUR_PROJECT_ID',
        'x-highlight-service': 'EXAMPLE_NODEJS_SERVICE',
    },
})

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.json(),
        format.errors({ stack: true }),
        format.timestamp(),
        format.prettyPrint(),
    ),
    transports: [new transports.Console(), highlightTransport],
})`,
				language: 'js',
			},
		},
		verifyLogs,
	],
}

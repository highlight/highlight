import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSWinstonHTTPJSONLogContent: QuickStartContent = {
	title: 'Winston',
	subtitle: 'Learn how to set up highlight.io log ingestion for Winston JS.',
	entries: [
		previousInstallSnippet('nodejs'),
		{
			title: 'Setup the Winston HTTP transport.',
			content:
				'The Winston HTTP transport will send JSON logs to highlight.io',
			code: {
				text: `import winston from 'winston'

const highlightTransport = new winston.transports.Http({
    host: 'pub.highlight.run',
    path: "/v1/logs/json",
    ssl: true,
    headers: {
        'x-highlight-project': 'YOUR_PROJECT_ID',
        'x-highlight-service': 'EXAMPLE_NODEJS_SERVICE',
    },
})

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
    ),
    transports: [new winston.transports.Console(), highlightTransport],
})`,
				language: 'js',
			},
		},
		verifyLogs,
	],
}

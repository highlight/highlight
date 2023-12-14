import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'
import { jsGetSnippet } from '../../backend/js/shared-snippets'

export const JSPinoHTTPJSONLogContent: QuickStartContent = {
	title: 'Logging with Pino.JS',
	subtitle: 'Learn how to set up highlight.io log ingestion for Pino.JS.',
	entries: [
		previousInstallSnippet('nodejs'),
		jsGetSnippet(['node', 'pino']),
		{
			title: 'Setup the Pino HTTP transport.',
			content:
				'The Pino HTTP transport will send JSON logs to highlight.io. ' +
				'Make sure to set the `project` and `service` query string parameters.',
			code: [
				{
					text: `import { H, Handlers } from '@highlight-run/node'

/** @type {import('@highlight-run/node').NodeOptions} */
const config = {
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: 'my-pino-app',
  serviceVersion: 'git-sha'
}
// the H.init call must be invoked before importing pino to attribute logs to the current context
H.init(config)

import pino from 'pino'

const logger = pino({
    level: 'info',
    transport: {
        targets: [
            {
                target: '@highlight-run/pino',
                options: config,
                level: 'info'
            },
        ],
    },
})

logger.info({ key: 'my-value' }, 'hello, highlight.io!')`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}

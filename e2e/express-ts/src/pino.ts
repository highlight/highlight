import pino from 'pino'
import { CONSTANTS } from './constants'

export function startPino() {
	const logger = pino({
		transport: {
			targets: [
				{
					target: '@highlight-run/pino',
					options: {
						projectID: CONSTANTS.HIGHLIGHT_PROJECT_ID,
						debug: true,
						serviceVersion: 'git-sha',
						otlpEndpoint: CONSTANTS.HIGHLIGHT_OTLP_ENDPOINT,
						serviceName: 'e2e-express-pino',
					},
					level: 'info',
				},
				{
					target: 'pino-pretty',
					options: {
						colorize: true,
					},
					level: 'info',
				},
			],
		},
	})

	logger.info('hello world')

	const child = logger.child({ a: 'property' })

	child.info('hello child!')
}

const highlightConfig = {
	projectID: '1',
	serviceName: 'highlight-io-pino',
	serviceVersion: 'git-sha',
} as NodeOptions

let pinoConfig = {
	level: 'debug',
} as LoggerOptions

if (process.env.NEXT_RUNTIME === 'nodejs') {
	const { H } = require('@highlight-run/node')
	H.init(highlightConfig)
	pinoConfig = {
		...pinoConfig,
		transport: {
			target: '@highlight-run/pino',
			options: highlightConfig,
		},
	}
}

import type { LoggerOptions } from 'pino'
import pino from 'pino'
import type { NodeOptions } from '@highlight-run/node'

const logger = pino(pinoConfig)

export default logger

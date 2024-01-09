const highlightConfig = {
	projectID: '1',
	serviceName: 'highlight-io-pino',
	serviceVersion: 'git-sha',
} as NodeOptions

let pinoConfig = {
	level: 'debug',
	transport: {
		target: '@highlight-run/pino',
		options: highlightConfig,
	},
} as LoggerOptions

if (
	typeof process.env.NEXT_RUNTIME === 'undefined' ||
	process.env.NEXT_RUNTIME === 'nodejs'
) {
	const { H } = require('@highlight-run/node')
	H.init(highlightConfig)
}

import type { LoggerOptions } from 'pino'
import pino from 'pino'
import type { NodeOptions } from '@highlight-run/node'

const logger = pino(pinoConfig)

export default logger

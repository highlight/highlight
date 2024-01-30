import { highlightConfig } from '@/instrumentation'
import type { LoggerOptions } from 'pino'

const pinoConfig = {
	level: 'debug',
	transport: {
		targets: [
			{
				target: 'pino-pretty',
				level: 'debug',
			},
			{
				target: '@highlight-run/pino',
				options: highlightConfig,
				level: 'debug',
			},
		],
	},
} as LoggerOptions

if (process.env.NEXT_RUNTIME === 'nodejs') {
	const { H } = require('@highlight-run/node')
	H.init(highlightConfig)
}

const logger = require('pino')(pinoConfig)
export default logger

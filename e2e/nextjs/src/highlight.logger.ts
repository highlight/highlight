import { highlightConfig } from '@/instrumentation'
import type { LoggerOptions } from 'pino'

const pinoConfig = {
	level: 'debug',
	transport: {
		targets: [
			{
				target: 'pino/file',
				options: { destination: 1 }, // this writes to STDOUT
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

const node =
	typeof process.env.NEXT_RUNTIME === 'undefined' ||
	process.env.NEXT_RUNTIME === 'nodejs'
if (node) {
	const { H } = require('@highlight-run/node')
	H.init(highlightConfig)
}

const logger = require('pino')(node ? {} : pinoConfig)
export default logger

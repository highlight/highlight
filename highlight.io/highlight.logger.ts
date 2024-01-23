import type { LoggerOptions } from 'pino'
import type { NodeOptions } from '@highlight-run/node'

const highlightConfig = {
	projectID: '4d7k1xeo',
	serviceName: 'highlight-io-pino',
	serviceVersion: 'git-sha',
} as NodeOptions

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

if (process.env.NEXT_RUNTIME === 'nodejs') {
	const { H } = require('@highlight-run/node')
	H.init(highlightConfig)
}

const logger = require('pino')(pinoConfig)
export default logger

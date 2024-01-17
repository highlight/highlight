import { highlightConfig } from '@/instrumentation'

let pinoConfig = {
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
}

if (
	typeof process.env.NEXT_RUNTIME === 'undefined' ||
	process.env.NEXT_RUNTIME === 'nodejs'
) {
	const { H } = require('@highlight-run/node')
	H.init(highlightConfig)
}

const logger = require('pino')(pinoConfig)
export default logger

// import type { LoggerOptions } from 'pino'
// import { isNodeJsRuntime } from '@highlight-run/next/server'

// const pinoConfig = {
// 	level: 'debug',
// 	transport: {
// 		targets: [
// 			// {
// 			// 	target: 'pino-pretty',
// 			// 	level: 'debug',
// 			// },
// 			// {
// 			// 	target: '@highlight-run/pino',
// 			// 	options: highlightConfig,
// 			// 	level: 'debug',
// 			// },
// 		],
// 	},
// } as LoggerOptions

// const logger = require('pino')(pinoConfig)
// export default logger

const logger = {
	info: (...args: unknown[]) => console.info(args),
}

export default logger

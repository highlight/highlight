import type { LoggerOptions } from 'pino'

const pinoConfig = {
	level: 'debug',
} as LoggerOptions

const logger = require('pino')(pinoConfig)
export default logger

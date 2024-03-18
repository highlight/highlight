import { isNodeJsRuntime } from '@highlight-run/next/server'
import type { NodeOptions } from '@highlight-run/node'
import type { LoggerOptions } from 'pino'

const highlightConfig = {
	projectID: '4d7k1xeo',
	serviceName: 'highlight-io-pino',
	serviceVersion: 'git-sha',
} as NodeOptions

const pinoConfig = {
	level: 'debug',
} as LoggerOptions

if (isNodeJsRuntime()) {
	const { H } = require('@highlight-run/node')
	H.init(highlightConfig)
}

const logger = require('pino')(pinoConfig)
export default logger

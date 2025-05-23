import { isNodeJsRuntime } from '@highlight-run/next/server'
import type { NodeOptions } from '@highlight-run/node'
import type { LoggerOptions } from 'pino'

const highlightConfig = {
	projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!,
	serviceName: 'highlight-io-pino',
	serviceVersion: 'git-sha',
	otlpEndpoint: 'https://otel.observability.app.launchdarkly.com',
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

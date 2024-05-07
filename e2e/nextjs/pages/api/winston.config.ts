import { Highlight } from '@highlight-run/next/server'
import winston from 'winston'
import { CONSTANTS } from '@/constants'
import type { NodeOptions } from '@highlight-run/node'

const highlightConfig = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'my-nextjs-instrumentation',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	disableConsoleRecording: false,
	debug: false,
} as NodeOptions

export const withHighlight = Highlight({
	...highlightConfig,
	serviceName: 'my-nextjs-backend-winston',
	environment: 'e2e-test',
})

const highlightTransport = new winston.transports.Http({
	host: 'localhost',
	port: 8082,
	ssl: true,
	path: `/v1/logs/json`,
	headers: {
		'x-highlight-project': highlightConfig.projectID,
		'x-highlight-service': 'e2e-nextjs',
	},
	level: 'success',
	format: winston.format.combine(
		winston.format.json(),
		winston.format.errors({ stack: true }),
		winston.format.timestamp(),
		winston.format.prettyPrint(),
	),
})

export const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.json(),
		winston.format.errors({ stack: true }),
		winston.format.timestamp(),
		winston.format.prettyPrint(),
	),
	transports: [new winston.transports.Console(), highlightTransport],
})

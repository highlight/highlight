import { highlightConfig } from '@/instrumentation'
import { Highlight } from '@highlight-run/next/server'
import winston from 'winston'

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
	level: 'debug',
	format: winston.format.combine(
		winston.format.json(),
		winston.format.errors({ stack: true }),
		winston.format.timestamp(),
		winston.format.prettyPrint(),
		winston.format((info) => {
			info.environment = 'custom-env'
			return info
		})(),
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

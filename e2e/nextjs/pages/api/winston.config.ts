import { Highlight } from '@highlight-run/next/server'
import winston from 'winston'

const projectID = '1jdkoe52'

export const withHighlight = Highlight({
	projectID,
	debug: true,
	backendUrl: 'https://localhost:8082/public',
	otlpEndpoint: 'http://localhost:4318',
	serviceName: 'my-nextjs-backend',
	environment: 'e2e-test',
})

const highlightTransport = new winston.transports.Http({
	host: 'localhost',
	port: 8082,
	ssl: true,
	path: `/v1/logs/json`,
	headers: {
		'x-highlight-project': projectID,
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

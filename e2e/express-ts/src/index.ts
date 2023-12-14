import { H, Handlers } from '@highlight-run/node'

/** @type {import('@highlight-run/node').NodeOptions} */
const config = {
	projectID: '1',
	debug: true,
	serviceName: 'e2e-express',
	serviceVersion: 'git-sha',
	otlpEndpoint: 'http://localhost:4318',
	environment: 'e2e-test',
}
H.init(config)

import pino from 'pino'
import express from 'express'

const logger = pino({
	transport: {
		targets: [
			{
				target: '@highlight-run/pino',
				options: {
					...config,
					serviceName: 'e2e-express-pino',
				},
				level: 'info',
			},
			{
				target: 'pino-pretty',
				options: {
					colorize: true,
				},
			},
		],
	},
})

logger.info('hello world')

const child = logger.child({ a: 'property' })
child.info('hello child!')

const app = express()
const port = 3003

// This should be before any controllers (route definitions)
app.use(Handlers.middleware(config))
app.get('/', (req, res) => {
	logger.info('base route')
	const err = new Error('this is a test error')
	const { secureSessionId, requestId } = H.parseHeaders(req.headers)
	if (secureSessionId && requestId) {
		logger.info({ secureSessionId, requestId }, 'have a context apparently')
		console.info('Sending error to highlight', secureSessionId, requestId)
		H.consumeError(err, secureSessionId, requestId)
	}
	res.send('Hello World!')
})

app.get('/good', (req, res) => {
	logger.warn('doing some heavy work!')
	let result = 0
	for (let i = 0; i < 1000; i++) {
		const value = Math.random() * 1000
		result += value
		logger.warn({ result, value }, 'some work happening')
	}
	res.send('yay!')
})

// This should be before any other error middleware and after all controllers (route definitions)
app.use(Handlers.errorHandler(config))
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

process.on('SIGINT', function () {
	process.exit()
})

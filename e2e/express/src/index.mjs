import express from 'express'
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

const app = express()
const port = 3003

// This should be before any controllers (route definitions)
app.use(Handlers.middleware(config))
app.get('/', (req, res) => {
	const err = new Error('this is a test error')
	const { secureSessionId, requestId } = H.parseHeaders(req.headers)
	if (secureSessionId && requestId) {
		console.info('Sending error to highlight', secureSessionId, requestId)
		H.consumeError(err, secureSessionId, requestId)
	}
	res.send('Hello World!')
})

app.get('/good', (req, res) => {
	console.warn('doing some heavy work!')
	let result = 0
	for (let i = 0; i < 1000; i++) {
		const value = Math.random() * 1000
		result += value
		console.warn('some work happening', { result, value })
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

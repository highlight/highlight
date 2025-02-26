import { H, Handlers } from '@highlight-run/node'
import { appendFileSync, unlinkSync } from 'node:fs'
import express from 'express'

/** @type {import('@highlight-run/node').NodeOptions} */
const config = {
	projectID: '1',
	debug: false,
	serviceName: 'e2e-express',
	serviceVersion: 'git-sha',
	otlpEndpoint: 'http://localhost:4318',
	environment: 'e2e-test',
	serializeConsoleAttributes: true,
}
console.log(`before init`, { hello: `hello` })
H.init(config)
console.log(`after init`, { hello: `hello` })
H.recordIncr({ name: 'startup' })

const app = express()
const port = 3003

// This should be before any controllers (route definitions)
app.use(Handlers.middleware(config))
app.get('/', (req, res) => {
	console.info('info from /')
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
		appendFileSync('test.txt', result.toString())
		H.recordMetric({ name: 'good.metric', value: result })
		H.recordHistogram({ name: 'good.histogram', value: result })
		H.recordCount({ name: 'good.count', value: i })
		H.recordIncr({ name: 'good.incr' })
		H.recordUpDownCounter({ name: 'good.up_down_counter', value: i })
	}
	unlinkSync('test.txt')
	res.send('yay!')
})

app.get('/bad', (req, res) => {
	throw new Error('this is an error')
})

app.get('/runWithHeaders', async (req, res) => {
	console.log('/runWithHeaders')
	return await H.runWithHeaders(
		`handle ${req.url}`,
		req.headers,
		async (span) => {
			console.log('/runWithHeaders handle span start')
			const resolved = await fetch(
				'https://api.sampleapis.com/coffee/hot',
			)
			const data = await resolved.json()
			res.send(data[0])
			console.log('/runWithHeaders ended')
			return data
		},
	)
})

// This should be before any other error middleware and after all controllers (route definitions)
app.use(Handlers.errorHandler(config))
console.log(`listen`, { hello: `hello` })
console.log({ message: 'world', hello: `hello`, number: '123' })
app.listen(port, () => {
	console.log(`startServer`, { at: `0.0.0.0:${port}` })
})

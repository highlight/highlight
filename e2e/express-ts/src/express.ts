import { H, Handlers } from '@highlight-run/node'
import { context } from '@opentelemetry/api'
import express from 'express'
import { config } from './instrumentation'

H.init(config)

const app = express()
const port = 3003

// This should be before any controllers (route definitions)
app.use(Handlers.middleware(config))
app.get('/', async (req, res) => {
	await H.runWithHeaders(req.headers, async () => {
		const err = new Error('this is a test error', {
			cause: { route: '/', foo: ['bar'] },
		})
		console.info('Sending error to highlight')
		H.consumeError(err)
		const { span, ctx } = H.startWithHeaders(
			'second-error',
			req.headers,
			{},
		)
		context.with(ctx, () => {
			H.consumeError(
				new Error('this is another test error', {
					cause: 'bad code',
				}),
			)
		})
		span.end()

		res.send('Hello World!')
	})
})

app.get('/good', async (req, res) => {
	await H.runWithHeaders(req.headers, () => {
		console.warn('doing some heavy work!')
		let result = 0
		for (let i = 0; i < 1000; i++) {
			const value = Math.random() * 1000
			result += value
			console.info('some work happening', { result, value })
		}

		res.send('yay!')
	})
})

// This should be before any other error middleware and after all controllers (route definitions)
app.use(Handlers.errorHandler(config))

export async function startExpress() {
	return new Promise<() => void>((resolve) => {
		const server = app.listen(port, () => {
			console.log(`Example app listening on port ${port}`)

			resolve(() => server.close())
		})
	})
}

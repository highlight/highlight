import { H, Handlers } from '@highlight-run/node'
import { context, type Span, trace } from '@opentelemetry/api'
import express from 'express'
import { config } from './instrumentation'
import { appendFile, unlinkSync } from 'node:fs'

const tracer = trace.getTracer('my-tracer', '0.1.0')

H.init(config)

const app = express()
const port = 3003

// This should be before any controllers (route definitions)
app.use(Handlers.middleware(config))
app.get('/', async (req, res) => {
	await H.runWithHeaders('custom /', req.headers, async () => {
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
	await H.runWithHeaders('custom /good', req.headers, () => {
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

app.get('/bad', async (req, res) => {
	throw new Error('oh no, an error!')
})

const roll = () => {
	return tracer.startActiveSpan(`doWork`, async (span: Span) => {
		console.log('doing work')
		let result: number = 0
		for (let i = 0; i < 100; i++) {
			await new Promise((r) =>
				appendFile('test.txt', result.toString(), r),
			)
			result += i
		}
		unlinkSync('test.txt')
		span.end()
		return result
	})
}

app.get('/test', async (req, res) => {
	const value = tracer.startActiveSpan('rollTheDice', (span: Span) => {
		const result = roll()
		// Be sure to end the span!
		span.end()
		return result
	})

	res.send(`value: ${value}`)
})

const startSpan = (name: string) => {
	return new Promise<Span>((resolve) =>
		tracer.startActiveSpan(name, {}, resolve),
	)
}

const roll2 = async () => {
	const span = await startSpan(`doWork2`)
	console.log('doing work 2')
	let result: number = 0
	for (let i = 0; i < 100; i++) {
		await new Promise((r) => appendFile('test.txt', result.toString(), r))
		result += i
	}
	unlinkSync('test.txt')
	span.end()
	return result
}

app.get('/test2', async (req, res) => {
	const span = await startSpan(`rollTheDice2`)
	console.log('roll 2')
	const value = await roll2()
	span.end()

	res.send(`value: ${value}`)
})

const roll3 = async () => {
	const spanP = startSpan(`doWork3`)
	console.log('doing work 3')
	let result: number = 0
	for (let i = 0; i < 100; i++) {
		await new Promise((r) => appendFile('test.txt', result.toString(), r))
		result += i
	}
	unlinkSync('test.txt')
	;(await spanP).end()
	return result
}

app.get('/test3', async (req, res) => {
	const spanP = startSpan(`rollTheDice3`)
	console.log('roll 3')
	const value = await roll3()
	;(await spanP).end()

	res.send(`value: ${value}`)
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

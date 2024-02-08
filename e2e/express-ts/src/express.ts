import type { Request, Response } from 'express'
import { H, Handlers } from '@highlight-run/node'
import { config } from './instrumentation'
import http from 'http'

H.init(config)

const express = require('express')

const app = express()
const port = 3003

const myEarlyMiddleware = (
	req: http.IncomingMessage,
	res: http.ServerResponse,
	next: () => void,
) => {
	H._debug('middleware handling request')
	H.runWithHeaders(req.headers, async () => {
		const span = await H.startActiveSpan('vadim-myEarlyMiddleware', {})
		await next()
		span.end()
	})
}
const myMiddleware = (
	req: http.IncomingMessage,
	res: http.ServerResponse,
	next: () => void,
) => {
	H._debug('middleware handling request')
	H.runWithHeaders(req.headers, async () => {
		const span = await H.startActiveSpan('vadim-myMiddleware', {})
		await next()
		span.end()
	})
}

// This should be before any controllers (route definitions)
app.use(myEarlyMiddleware)
app.use(Handlers.middleware(config))
app.use(myMiddleware)
app.use(
	(req: http.IncomingMessage, res: http.ServerResponse, next: () => any) => {
		H._debug('middleware handling request')
		return H.runWithHeaders(req.headers, async () => {
			const span = await H.startActiveSpan('vadim-anon-middleware', {})
			await next()
			span.end()
		})
	},
)
app.get('/', (req: Request, res: Response) => {
	return H.runWithHeaders(req.headers, async () => {
		await H.startActiveSpan('vadim-sync-/', {})
		const err = new Error('this is a test error', {
			cause: { route: '/', foo: ['bar'] },
		})
		console.info('Sending error to highlight')
		H.consumeError(err)
		H.consumeError(
			new Error('this is another test error', {
				cause: 'bad code',
			}),
		)

		res.send('Hello World!')
	})
})

app.get('/good', (req: Request, res: Response) => {
	return H.runWithHeaders(req.headers, async () => {
		await H.startActiveSpan('vadim-sync-/good', {})
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

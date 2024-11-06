import { H, Handlers } from '@highlight-run/node'
import { context } from '@opentelemetry/api'
import express from 'express'
import { config } from './instrumentation'
import { prisma } from './prisma'

H.init(config)

const app = express()
const port = 3003

app.use(express.json())

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

app.post('/users', async (req, res) => {
	try {
		const { name } = req.body
		const user = await prisma.user.create({
			data: { name },
		})
		res.json(user)
	} catch (error) {
		console.error('Failed to create user:', error)
		res.status(500).json({ error: 'Failed to create user' })
	}
})

app.get('/users', async (req, res) => {
	try {
		const users = await prisma.user.findMany()
		res.json(users)
	} catch (error) {
		console.error('Failed to fetch users:', error)
		res.status(500).json({ error: 'Failed to fetch users' })
	}
})

app.delete('/users/:id', async (req, res) => {
	try {
		const { id } = req.params
		await prisma.user.delete({
			where: { id: parseInt(id) },
		})
		res.json({ message: 'User deleted' })
	} catch (error) {
		console.error('Failed to delete user:', error)
		res.status(500).json({ error: 'Failed to delete user' })
	}
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

import { Server } from '@logux/server'
import { H } from '@highlight-run/node'

H.init({
	projectID: '3',
	otlpEndpoint: 'http://localhost:4318',
	serviceName: 'logux-server',
})
const server = new Server(
	Server.loadOptions(process, {
		subprotocol: '1.0.0',
		supports: '1.x',
		fileUrl: import.meta.url,
	}),
)

server.auth(({}) => {
	console.log('auth')
	return true
})

server.type('INCREMENT', {
	access(ctx, action, meta) {
		console.log('INCREMENT access', { ctx, action, meta })
		return true
	},
	resend(ctx, action, meta) {
		console.log('INCREMENT resend', { ctx, action, meta })
		return { counter: ctx.counter }
	},
	async process(ctx, action, meta) {
		console.log('INCREMENT process', { ctx, action, meta })
		ctx.counter += 1
	},
})

server.type('DECREMENT', {
	access(ctx, action, meta) {
		console.log('DECREMENT access', { ctx, action, meta })
		return true
	},
	resend(ctx, action, meta) {
		console.log('DECREMENT resend', { ctx, action, meta })
		return { counter: ctx.counter }
	},
	async process(ctx, action, meta) {
		console.log('DECREMENT process', { ctx, action, meta })
		ctx.counter -= 1
	},
})

server.listen()

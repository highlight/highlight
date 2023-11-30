import { Server } from '@logux/server'

const server = new Server(
	Server.loadOptions(process, {
		subprotocol: '1.0.0',
		supports: '1.x',
		fileUrl: import.meta.url,
	}),
)

server.auth(({}) => {
	return true
})

server.type('INCREMENT', {
	access(ctx, action, meta) {
		return true
	},
	resend(ctx, action, meta) {
		return { counter: ctx.counter }
	},
	async process(ctx, action, meta) {
		ctx.counter += 1
	},
})

server.type('DECREMENT', {
	access(ctx, action, meta) {
		return true
	},
	resend(ctx, action, meta) {
		return { counter: ctx.counter }
	},
	async process(ctx, action, meta) {
		ctx.counter -= 1
	},
})

server.listen()

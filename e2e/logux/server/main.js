import { fileURLToPath } from 'url'
import { isFirstOlder } from '@logux/core'
import { dirname } from 'path'
import { Server } from '@logux/server'

const server = new Server(
	Server.loadOptions(process, {
		subprotocol: '1.0.0',
		supports: '1.x',
		fileUrl: import.meta.url,
	}),
)

server.auth(async ({ userId, token }) => {
	const user = await findUserByToken(token)
	return !!user && userId === user.id
})

server.channel('user/:id', {
	access(ctx, action, meta) {
		return ctx.params.id === ctx.userId
	},
	async load(ctx, action, meta) {
		const user = await db.loadUser(ctx.params.id)
		return { type: 'USER_NAME', name: user.name }
	},
})

server.type('CHANGE_NAME', {
	access(ctx, action, meta) {
		return action.user === ctx.userId
	},
	resend(ctx, action, meta) {
		return { channel: `user/${ctx.userId}` }
	},
	async process(ctx, action, meta) {
		if (isFirstOlder(lastNameChange(action.user), meta)) {
			await db.changeUserName({ id: action.user, name: action.name })
		}
	},
})

server.listen()

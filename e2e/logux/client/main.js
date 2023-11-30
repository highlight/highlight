import { CrossTabClient, badge, badgeEn, log } from '@logux/client'
import { badgeStyles } from '@logux/client/badge/styles'

let userId = document.querySelector('meta[name=user]').content
let token = document.querySelector('meta[name=token]').content

const client = new CrossTabClient({
	subprotocol: '1.0.0',
	server: 'wss://example.com:1337',
	userId,
	token,
})

badge(client, { messages: badgeEn, styles: badgeStyles })
log(client)

client.start()

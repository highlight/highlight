// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { logger, withHighlight } from './winston.config'

function handler() {
	const user = {
		name: 'vadim',
	} as any
	for (let i = 0; i < 100; i++) {
		user[i.toString()] = Math.random()
	}

	logger.info('User authed', user)
	logger.warn(`User auther stringify: ${JSON.stringify(user)}`)

	logger.info('hey winston', { foo: 'bar' })
	console.log('hey handler')
	console.warn('warning!')
	if (Math.random() < 0.25) {
		throw new Error(`a random api error occurred! ${Math.random()}`)
	}
	console.error(`whoa there! ${Math.random()}`)
	logger.error(`whoa there! ${Math.random()}`, { val: Math.random() })
}

export default withHighlight(handler)

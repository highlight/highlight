// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { logger, withHighlight } from './winston.config'

function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = {
		name: 'vadim',
	} as any
	logger.info({ key: 'my json message', foo: 'bar', user })

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

	res.status(200).json({ message: 'Hello from Next.js!' })
}

export default withHighlight(handler)

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { logger, withHighlight } from '../../../highlight.config'
import { useEffect, useState } from 'react'

type Data = {
	name: string
}

function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
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
	res.status(200).json({ name: 'John Doe' })
}

export default withHighlight(handler)

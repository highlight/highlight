// pages/api/page-router-trace.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	return new Promise<void>(async (resolve) => {
		console.info('Here: /pages/api/page-router-trace.ts ⌚⌚⌚')

		res.send(`Trace sent! Check out this random number: ${Math.random()}`)
		resolve()
	})
}

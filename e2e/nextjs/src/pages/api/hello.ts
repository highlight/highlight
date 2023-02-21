// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withHighlight } from '../../../highlight.config'

type Data = {
	name: string
}

function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (Math.random() < 0.25) {
		throw new Error(`a random api error occurred! ${Math.random()}`)
	}
	res.status(200).json({ name: 'John Doe' })
}

export default withHighlight(handler)

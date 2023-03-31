import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { quickStartContent } from '../../components/QuickstartContent/QuickstartContent'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	await NextCors(req, res, {
		methods: ['GET'],
		origin: '*',
	})

	res.status(200).json(quickStartContent)
}

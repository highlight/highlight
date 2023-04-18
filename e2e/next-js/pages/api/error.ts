import { NextApiRequest, NextApiResponse } from 'next'

import { withHighlight } from '@/app/utils/highlight.config'

export default withHighlight(function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	console.info('Here: pages/api/error')

	throw new Error('This is an error')

	res.send('Success: pages/api/error')
})

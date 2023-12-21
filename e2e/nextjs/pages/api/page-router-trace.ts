// pages/api/page-router-trace.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '@/app/_utils/page-router-highlight.config'
import { H } from '@highlight-run/next/server'

export default withPageRouterHighlight(async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	return new Promise<void>(async (resolve) => {
		const span = await H.startActiveSpan('page-router-span', {})

		console.info('Here: /pages/api/page-router-trace.ts ⌚⌚⌚')

		res.send(`Trace sent! Check out this random number: ${Math.random()}`)
		span.end()
		resolve()
	})
})

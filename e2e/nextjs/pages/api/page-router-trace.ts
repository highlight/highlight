// pages/api/page-router-trace.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '@/app/_utils/page-router-highlight.config'

export default withPageRouterHighlight(async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
	highlight,
) {
	return new Promise<void>((resolve) => {
		highlight?.tracer.startActiveSpan('page-router-span', async (span) => {
			console.info('Here: /pages/api/page-router-trace.ts ⌚⌚⌚')

			res.send(
				`Trace sent! Check out this random number: ${Math.random()}`,
			)
			span.end()
			resolve()
		})
	})
})

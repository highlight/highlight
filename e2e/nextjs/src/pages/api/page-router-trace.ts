// pages/api/page-router-trace.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '@/app/_utils/page-router-highlight.config'
import { H } from '@highlight-run/next/server'
import { context, propagation } from '@opentelemetry/api'

export default withPageRouterHighlight(async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	return new Promise<void>(async (resolve) => {
		const { span } = H.startWithHeaders('page-router-span', {})

		const headers = {}
		await fetch('http://localhost:3010/x-highlight-request', {
			method: 'GET',
			// forward headers
			headers: Object.entries(req.headers).reduce(
				(acc, [key, value]) => ({ ...acc, [key]: value }),
				{},
			),
		}).catch(() =>
			console.info('Inactive go service at http://localhost:3010'),
		)

		await fetch('http://localhost:3010/traceparent', {
			method: 'GET',
			headers,
		}).catch(() =>
			console.info('Inactive go service at http://localhost:3010'),
		)

		propagation.inject(context.active(), headers)
		await fetch('http://localhost:3010/traceparent', {
			method: 'GET',
			headers,
		}).catch(() =>
			console.info('Inactive go service at http://localhost:3010'),
		)

		console.info('Here: /pages/api/page-router-trace.ts ⌚⌚⌚', {
			headers,
		})

		res.send(`Trace sent! Check out this random number: ${Math.random()}`)
		span.end()
		resolve()
	})
})

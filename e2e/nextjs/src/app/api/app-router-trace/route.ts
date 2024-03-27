// app/api/app-router-trace/route.ts
import { NextRequest } from 'next/server'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'
import { H } from '@highlight-run/next/server'
import logger from '@/highlight.logger'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	return new Promise(async (resolve) => {
		const span = await H.startActiveSpan('app-router-span', {})

		logger.info({}, `app router trace get`)

		await fetch('http://localhost:3010/x-highlight-request', {
			method: 'GET',
			headers: request.headers, // Forward headers, x-highlight-request is critical
		}).catch(() =>
			console.info('Inactive go service at http://localhost:3010'),
		)

		await fetch('http://localhost:3010/traceparent', {
			method: 'GET',
			headers: request.headers,
		}).catch(() =>
			console.info('Inactive go service at http://localhost:3010'),
		)

		console.info('Here: /pages/api/app-router-trace/route.ts ⏰⏰⏰')

		span.end()

		resolve(new Response('Success: /api/app-router-trace'))
	})
})

export const runtime = 'nodejs'

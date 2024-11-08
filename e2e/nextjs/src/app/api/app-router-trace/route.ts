// app/api/app-router-trace/route.ts
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'
import logger from '@/highlight.logger'
import { H } from '@highlight-run/next/server'
import { NextRequest } from 'next/server'
import { propagation, context } from '@opentelemetry/api'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	return new Promise(async (resolve) => {
		const { span } = H.startWithHeaders('app-router-span', {})

		logger.info({}, `app router trace get`)

		const headers = {}
		await fetch('http://localhost:3010/x-highlight-request', {
			method: 'GET',
			headers: request.headers, // Forward headers, x-highlight-request is critical
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

		console.info('Here: /pages/api/app-router-trace/route.ts ⏰⏰⏰', {
			headers,
		})

		span.end()

		resolve(new Response('Success: /api/app-router-trace'))
	})
})

export const runtime = 'nodejs'

// app/api/app-router-trace/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'
import { H } from '@highlight-run/next/server'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	return new Promise(async (resolve) => {
		const span = await H.startActiveSpan('app-router-span', {})

		console.info('Here: /pages/api/app-router-trace/route.ts ⏰⏰⏰')

		span.end()

		resolve(new Response('Success: /api/app-router-trace'))
	})
})

export const runtime = 'nodejs'

// app/api/app-router-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/app-router-test/route.ts 💘💘💘', { success })

	if (success === 'true') {
		return new Response('Success: /api/app-router-test')
	} else {
		throw new Error('Error: /api/app-router-test (App Router)')
	}
})

export const POST = withAppRouterHighlight(async function POST(
	request: Request,
) {
	const headers = Object.fromEntries(request.headers.entries())

	return NextResponse.json({
		body: { headers },
	})
})

export const runtime = 'nodejs'

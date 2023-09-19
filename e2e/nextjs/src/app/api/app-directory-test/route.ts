import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAppRouterHighlight } from '@/app/utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/app-directory-test/route.ts 💘💘💘', { success })

	if (success === 'true') {
		return new Response('Success: /api/app-directory-test')
	} else {
		throw new Error('Error: /api/app-directory-test (App Router)')
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

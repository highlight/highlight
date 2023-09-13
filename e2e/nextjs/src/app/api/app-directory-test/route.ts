import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { HighlightEnv, Highlight } from '@highlight-run/next/app-router'
import CONSTANTS from '@/app/constants'

const env: HighlightEnv = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID || '2',
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'vercel-app-directory',
}

const withHighlight = Highlight(env)

export const GET = withHighlight(async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/app-directory-test/route.ts 💘💘💘', { success })

	if (success === 'true') {
		return new Response('Success: /api/app-directory-test')
	} else {
		throw new Error('Error: /api/app-directory-test (App Router)')
	}
})

export const POST = withHighlight(async function POST(request: Request) {
	const headers = Object.fromEntries(request.headers.entries())

	return NextResponse.json({
		body: { headers },
	})
})

export const runtime = 'nodejs'

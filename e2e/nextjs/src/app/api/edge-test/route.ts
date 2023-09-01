import { H, Highlight, HighlightEnv } from '@highlight-run/next/edge'
import type { NextFetchEvent, NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { z } from 'zod'

const env: HighlightEnv = {
	HIGHLIGHT_PROJECT_ID: process.env.HIGHLIGHT_PROJECT_ID || '2',
	HIGHLIGHT_OTLP_ENDPOINT: process.env.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
}

const withHighlight = Highlight(env)

export const GET = withHighlight(async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	H.setAttributes({ runtime: 'edge', test: '🌠🌠🌠 stars!!! 🌠🌠🌠' })

	console.info('Here: /api/edge-test/route.ts 🌚🌚🌚', { success })

	if (success === 'true') {
		return new Response('Success: /api/edge-test')
	} else {
		throw new Error(
			'Error: /api/edge-test using new @highlight-run/next/edge import',
		)
	}
})

export const POST = withHighlight(async function POST(
	request: NextRequest,
	context: NextFetchEvent,
) {
	H.init(request, env, context)

	const headers = Object.fromEntries(request.headers.entries())

	return NextResponse.json({
		body: { headers },
	})
})

export const runtime = 'edge'

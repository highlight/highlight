// src/app/api/edge-test/route.ts
import { H } from '@highlight-run/next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { withEdgeHighlight } from '@/app/_utils/edge-highlight.config'

import { NextResponse } from 'next/server'
import { z } from 'zod'

export const GET = withEdgeHighlight(async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	H.setAttributes({ runtime: 'edge', test: '🌠🌠🌠 stars!!! 🌠🌠🌠' })

	console.info('Here: /api/edge-test/route.ts 🌚🌚🌚', { success })

	if (success === 'true') {
		return new Response('Success: /api/edge-test')
	} else {
		throw new Error('Error: /api/edge-test (Edge Runtime)')
	}
})

export const POST = withEdgeHighlight(async function POST(
	request: NextRequest,
	context: NextFetchEvent,
) {
	const headers = Object.fromEntries(request.headers.entries())

	return NextResponse.json({
		body: { headers },
	})
})

export const runtime = 'edge'

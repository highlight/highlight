// src/app/api/edge-test/route.ts
import { withEdgeHighlight } from '@/app/_utils/edge-highlight.config'
import { H } from '@highlight-run/next/server'
import { z } from 'zod'

export const GET = withEdgeHighlight(async function GET(request: Request) {
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

export const POST = withEdgeHighlight(async function POST(request: Request) {
	const headers = Object.fromEntries(request.headers.entries())

	return Response.json({
		body: { headers },
	})
})

export const PUT = withEdgeHighlight(async function GET(request: Request) {
	try {
		throw new Error('yo')
	} catch (error: any) {
		console.log(error)
		const parsedHeaders = H.parseHeaders(request.headers)
		H.consumeError(
			error,
			parsedHeaders.secureSessionId,
			parsedHeaders.requestId,
		)
		return Response.json({ hello: 'world' })
	}
})

export const runtime = 'edge'

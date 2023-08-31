import { H, HighlightEnv } from '@highlight-run/next/edge'
import type { NextFetchEvent, NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { z } from 'zod'

const env: HighlightEnv = {
	HIGHLIGHT_PROJECT_ID: '1',
}

type Handler = (
	request: NextRequest,
	context: NextFetchEvent,
) => Promise<Response>

export const GET = withHighlight(async function GET(
	request: NextRequest,
	context: NextFetchEvent,
) {
	H.init(request, env, context)

	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/edge-test/route.ts', { success })

	if (success === 'true') {
		return new Response('Success: /api/edge-test')
	} else {
		throw new Error(
			'Error: /api/edge-test using new @highlight-run/next/edge import',
		)
	}
})

export const POST = async function POST(
	request: NextRequest,
	context: NextFetchEvent,
) {
	H.init(request, env, context)

	const headers = Object.fromEntries(request.headers.entries())

	return NextResponse.json({
		body: { headers },
	})
}

export const runtime = 'edge'

function withHighlight(handler: Handler) {
	return async function (request: NextRequest, context: NextFetchEvent) {
		H.init(request, env, context)

		try {
			const response = await handler(request, context)

			H.sendResponse(response)

			console.log('sending response', response)

			return response
		} catch (error) {
			console.log('🤖 error')
			if (error instanceof Error) {
				console.log('🤖 error.message')
				H.consumeError(error)
			}

			throw error
		}
	}
}

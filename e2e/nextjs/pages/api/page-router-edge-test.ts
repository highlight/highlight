// pages/api/test.ts
import { NextRequest } from 'next/server'

import { withEdgeHighlight } from '@/app/_utils/edge-highlight.config'
import { z } from 'zod'

export default withEdgeHighlight(async function handler(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/page-router-edge-test/route.ts 🌚🌚🌚', {
		success,
	})

	if (success === 'true') {
		return new Response('Success: /api/page-router-edge-test')
	} else {
		throw new Error('Error: /api/page-router-edge-test (Edge Runtime)')
	}
})

export const runtime = 'edge'

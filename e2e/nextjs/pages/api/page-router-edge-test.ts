// pages/api/test.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextFetchEvent } from 'next/server'

import { withEdgeHighlight } from '@/app/utils/edge-highlight.config'
import { z } from 'zod'

export default withEdgeHighlight(async function handler(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/edge-test/route.ts 🌚🌚🌚', { success })

	if (success === 'true') {
		return new Response('Success: /api/edge-test')
	} else {
		throw new Error('Error: /api/edge-test (Edge Runtime)')
	}
})

export const runtime = 'edge'

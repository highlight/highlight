import { NextRequest } from 'next/server'
// import { withHighlight } from '@/app/utils/highlight.config'
import { z } from 'zod'

export const GET = async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/app-directory-test', { success })

	if (success === 'true') {
		return new Response('Success: /api/app-directory-test')
	} else {
		throw new Error('Error: /api/app-directory-test')
	}
}

export const runtime = 'nodejs'

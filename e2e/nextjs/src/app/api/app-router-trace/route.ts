// app/api/app-router-trace/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
	context,
	highlight,
) {
	return new Promise((resolve) => {
		highlight?.tracer.startActiveSpan('app-router-span', async (span) => {
			console.info('Here: /pages/api/app-router-trace/route.ts ⏰⏰⏰')

			span.end()

			resolve(new Response('Success: /api/app-router-trace'))
		})
	})
})

export const runtime = 'nodejs'

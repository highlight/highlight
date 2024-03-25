import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { highlightMiddleware, HighlightEnv } from '@highlight-run/next/server'

import { CONSTANTS } from '@/constants'

const highlightConfig = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'my-nextjs-backend',
	environment: 'e2e-test',
} as HighlightEnv

export function middleware(request: NextRequest, event: NextFetchEvent) {
	const { headers } = highlightMiddleware(request, highlightConfig, event)

	return NextResponse.next({ headers })
}

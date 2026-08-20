// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { highlightMiddleware } from '@highlight-run/next/server'

// Landing page and docs routing now lives in next.config.ts, which redirects
// every page to launchdarkly.com before middleware runs. See
// shared/launchdarkly-redirects.ts.
export default async function middleware(req: NextRequest) {
	await highlightMiddleware(req)
	return NextResponse.next()
}

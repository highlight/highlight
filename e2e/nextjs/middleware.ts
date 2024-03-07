import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { highlightMiddleware } from '@highlight-run/next/server'

export function middleware(request: NextRequest) {
	highlightMiddleware(request)

	return NextResponse.next()
}

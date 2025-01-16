import { highlightMiddleware } from '@highlight-run/next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: Request) {
	await highlightMiddleware(request)

	return NextResponse.next()
}

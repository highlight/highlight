import type { NextRequest } from 'next/server'

export function highlightMiddleware(request: NextRequest) {
	const sessionSecureID = request.cookies.get('sessionSecureID')?.value
	const xHighlightRequest = request.headers.get('x-highlight-request')
	if (!xHighlightRequest && sessionSecureID) {
		request.headers.set('x-highlight-request', `${sessionSecureID}/`)
	}
}

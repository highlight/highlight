import { cookies } from 'next/headers'

export async function highlightMiddleware(request: Request) {
	const sessionSecureID = (await cookies()).get('sessionSecureID')?.value
	const xHighlightRequest = request.headers.get('x-highlight-request')
	if (!xHighlightRequest && sessionSecureID) {
		request.headers.set('x-highlight-request', `${sessionSecureID}/`)
	}
}

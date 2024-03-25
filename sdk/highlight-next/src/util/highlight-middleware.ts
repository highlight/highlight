import type { NextRequest } from 'next/server'
import { H, HighlightEnv } from './highlight-edge'
import { ExtendedExecutionContext } from './types'

export function highlightMiddleware(
	request: NextRequest,
	env?: HighlightEnv,
	ctx?: ExtendedExecutionContext,
) {
	const sessionSecureID = request.cookies.get('sessionSecureID')?.value
	let xHighlightRequest = request.headers.get('x-highlight-request')

	if (!xHighlightRequest && sessionSecureID) {
		xHighlightRequest = `${sessionSecureID}/`
		request.headers.set('x-highlight-request', xHighlightRequest)
	}

	if (env && ctx) {
		try {
			H.initEdge(request, env, ctx)
		} catch (error) {
			console.log('🤬 H.initEdge error', error)
		}
	}

	return {
		headers: {
			'x-highlight-request': xHighlightRequest ?? '',
		},
	}
}

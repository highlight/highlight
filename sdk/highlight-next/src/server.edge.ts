export type { HighlightEnv } from './util/types'

import * as withHighlightEdge from './util/with-highlight-edge'
import type { NextRequest } from 'next/server'

import type { HighlightEnv } from './util/types'
export { H } from './util/highlight-edge'

export function registerHighlight() {}

export function EdgeHighlight(env: HighlightEnv) {
	if (process.env.NEXT_RUNTIME === 'edge') {
		return withHighlightEdge.Highlight(env)
	} else {
		throw new Error(
			`Do not use EdgeHighlight() in the ${process.env.NEXT_RUNTIME} runtime`,
		)
	}
}

export function PageRouterHighlight(_: HighlightEnv) {
	throw new Error('Do not use PageRouterHighlight() in the edge runtime.')
}

export function AppRouterHighlight(_: HighlightEnv) {
	throw new Error('Do not use AppRouterHighlight() in the edge runtime.')
}

export function highlightMiddleware(request: NextRequest) {
	const sessionSecureID = request.cookies.get('sessionSecureID')?.value
	const xHighlightRequest = request.headers.get('x-highlight-request')
	if (!xHighlightRequest && sessionSecureID) {
		request.headers.set('x-highlight-request', sessionSecureID)
	}
}

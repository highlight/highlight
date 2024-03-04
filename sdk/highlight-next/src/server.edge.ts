export type { HighlightEnv } from './util/types'

import * as withHighlightEdge from './util/with-highlight-edge'

import type { HighlightEnv } from './util/types'
export { H } from './util/highlight-edge'
export { highlightMiddleware } from './util/highlight-middleware'

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

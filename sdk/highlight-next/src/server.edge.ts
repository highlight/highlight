export type { HighlightEnv } from './util/types'
import type { HighlightEnv } from './util/types'
export { H } from '@highlight-run/cloudflare' // Imports from server.edge.ts for the edge runtime
import * as withHighlightEdge from './util/with-highlight-edge'

export function registerHighlight() {
	throw new Error('registerHighlight() is not supported in the edge runtime.')
}

export function EdgeHighlight(env: HighlightEnv) {
	if (process.env.NEXT_RUNTIME === 'edge') {
		return withHighlightEdge.Highlight(env)
	} else {
		throw new Error(`unsupported NEXT_RUNTIME: ${process.env.NEXT_RUNTIME}`)
	}
}

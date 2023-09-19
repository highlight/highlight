export {
	Highlight,
	EdgeHighlight,
	AppRouterHighlight,
	PageRouterHighlight,
} from './server'

export type { HighlightEnv } from './util/types'
export { H } from '@highlight-run/cloudflare' // Imports from server.edge.ts for the edge runtime

export function registerHighlight() {
	throw new Error('registerHighlight() is not supported in the edge runtime.')
}

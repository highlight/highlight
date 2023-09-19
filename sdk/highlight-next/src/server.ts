import * as withHighlightNodeJsPageRouter from './util/with-highlight-nodejs-page-router'
import * as withHighlightNodeJsAppRouter from './util/with-highlight-nodejs-app-router'

import type { HighlightEnv } from './util/types'

export { registerHighlight } from './util/registerHighlight'
export { withHighlightConfig } from './util/withHighlightConfig'
export type { HighlightEnv } from './util/types'
import type {
	EdgeHandler,
	ExtendedExecutionContext,
} from './util/with-highlight-edge'
import { NextRequest, NextFetchEvent } from 'next/server'
export { H } from '@highlight-run/node' // Imports from server.edge.ts for the edge runtime

type PageRouterHighlightHandler = ReturnType<
	typeof withHighlightNodeJsPageRouter.Highlight
>

export const Highlight = PageRouterHighlight
export function PageRouterHighlight(
	env: HighlightEnv,
): PageRouterHighlightHandler {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		return withHighlightNodeJsPageRouter.Highlight(env)
	} else {
		throw new Error(
			`unidentified NEXT_RUNTIME: ${process.env.NEXT_RUNTIME}`,
		)
	}
}

export function AppRouterHighlight(env: HighlightEnv) {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		return withHighlightNodeJsAppRouter.Highlight(env)
	} else {
		throw new Error(
			`unidentified NEXT_RUNTIME: ${process.env.NEXT_RUNTIME}`,
		)
	}
}

export function EdgeHighlight(
	_: HighlightEnv,
): (
	handler: EdgeHandler,
) => (
	request: NextRequest,
	event: NextFetchEvent & ExtendedExecutionContext,
) => Promise<Response> {
	throw new Error(`unsupported NEXT_RUNTIME: ${process.env.NEXT_RUNTIME}`)
}

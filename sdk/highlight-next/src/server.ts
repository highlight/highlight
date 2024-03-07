import * as withHighlightNodeJsPageRouter from './util/with-highlight-nodejs-page-router'
import * as withHighlightNodeJsAppRouter from './util/with-highlight-nodejs-app-router'

import type { ExtendedExecutionContext, HighlightEnv } from './util/types'
import type { EdgeHandler } from './util/with-highlight-edge'
import type { NextFetchEvent, NextRequest } from 'next/server'

export { registerHighlight } from './util/register-highlight'
export type { HighlightEnv } from './util/types'
export { H } from '@highlight-run/node' // Imports from server.edge.ts for the edge runtime
export { highlightMiddleware } from './util/highlight-middleware'

type PageRouterHighlightHandler = ReturnType<
	typeof withHighlightNodeJsPageRouter.Highlight
>

export const Highlight = PageRouterHighlight
export function PageRouterHighlight(
	env: HighlightEnv,
): PageRouterHighlightHandler {
	if (isNodeJs()) {
		return withHighlightNodeJsPageRouter.Highlight(env)
	} else {
		throw new Error(
			`unidentified NEXT_RUNTIME: ${process.env.NEXT_RUNTIME}`,
		)
	}
}

export function AppRouterHighlight(env: HighlightEnv) {
	if (isNodeJs()) {
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

function isNodeJs() {
	return (
		typeof process.env.NEXT_RUNTIME === 'undefined' ||
		process.env.NEXT_RUNTIME === 'nodejs'
	)
}

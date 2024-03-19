import * as withHighlightNodeJsPageRouter from './util/with-highlight-nodejs-page-router'
import * as withHighlightNodeJsAppRouter from './util/with-highlight-nodejs-app-router'

import type { ExtendedExecutionContext, HighlightEnv } from './util/types'
import type { EdgeHandler } from './util/with-highlight-edge'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { isNodeJsRuntime } from './util/is-node-js-runtime'
import type { WorkersSDK } from '@highlight-run/opentelemetry-sdk-workers'
import type { HighlightEnv as CloudflareHighlightEnv } from '@highlight-run/cloudflare'

export { isNodeJsRuntime } from './util/is-node-js-runtime'
export { registerHighlight } from './util/register-highlight'
export type { HighlightEnv } from './util/types'
import { H as NodeH } from '@highlight-run/node' // Imports from server.edge.ts for the edge runtime
export { highlightMiddleware } from './util/highlight-middleware'

type PageRouterHighlightHandler = ReturnType<
	typeof withHighlightNodeJsPageRouter.Highlight
>

export const H = {
	...NodeH,
	initEdge: (
		request: Request,
		env: CloudflareHighlightEnv,
		ctx: ExtendedExecutionContext,
	): WorkersSDK => {
		throw new Error('H.initEdge not implemented in nodejs runtime')
	},
}

export const Highlight = PageRouterHighlight
export function PageRouterHighlight(
	env: HighlightEnv,
): PageRouterHighlightHandler {
	if (isNodeJsRuntime()) {
		return withHighlightNodeJsPageRouter.Highlight(env)
	} else {
		throw new Error(
			`unidentified NEXT_RUNTIME: ${process.env.NEXT_RUNTIME}`,
		)
	}
}

export function AppRouterHighlight(env: HighlightEnv) {
	if (isNodeJsRuntime()) {
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

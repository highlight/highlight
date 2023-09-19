import { H } from './highlight-edge'
import type { NodeOptions } from '@highlight-run/node'
import type { ExecutionContext } from '@cloudflare/workers-types'
import type { NextFetchEvent, NextRequest } from 'next/server'

export type HighlightEnv = NodeOptions

export type EdgeHandler = (
	request: NextRequest,
	event: NextFetchEvent,
) => Promise<Response>

export type ExtendedExecutionContext = ExecutionContext & {
	__waitUntilTimer?: ReturnType<typeof setInterval>
	__waitUntilPromises?: Promise<void>[]
	waitUntilFinished?: () => Promise<void>
}

export function Highlight(env: HighlightEnv) {
	return function withHighlight(handler: EdgeHandler) {
		return async function (
			request: NextRequest,
			event: NextFetchEvent & ExtendedExecutionContext,
		) {
			H.initEdge(request, env, event)

			try {
				const response = await handler(request, event)

				H.sendResponse(response)

				return response
			} catch (error) {
				if (error instanceof Error) {
					H.consumeError(error)
				}

				/**
				 * H.consumeError is completely async, so if we throw the error too quickly after
				 * calling H.consumeError, we're effectively short-circuiting ctx.waitUntil.
				 *
				 * ctx.waitUntilFinished will wait for the promises to settle before throwing.
				 */
				if (event.waitUntilFinished) {
					await event.waitUntilFinished()
				}

				throw error
			}
		}
	}
}

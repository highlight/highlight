import { H } from './highlight-edge'
import type { NodeOptions } from '@highlight-run/node'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { ExtendedExecutionContext } from './types'
import { IncomingHttpHeaders } from 'http'

export type HighlightEnv = NodeOptions

export type EdgeHandler = (
	request: NextRequest,
	event: NextFetchEvent,
) => Promise<Response>

export function Highlight(env: HighlightEnv) {
	return function withHighlight(handler: EdgeHandler) {
		return async function (
			request: NextRequest,
			event: NextFetchEvent & ExtendedExecutionContext,
		) {
			H.initEdge(request, env, event)
			const headers: IncomingHttpHeaders = {}
			request.headers.forEach((k, v) => (headers[k] = v))

			try {
				const response = await H.runWithHeaders(headers, async () => {
					return await handler(request, event)
				})

				H.sendResponse(response)

				return response
			} catch (error) {
				const { secureSessionId, requestId } = H.parseHeaders(headers)
				if (error instanceof Error) {
					H.consumeError(error, secureSessionId, requestId)
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

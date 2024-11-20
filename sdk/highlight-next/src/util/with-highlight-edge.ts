import type { NodeOptions } from '@highlight-run/node'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { H } from './highlight-edge'
import { ExtendedExecutionContext } from './types'

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
			if (env.enableFsInstrumentation) {
				console.warn(
					'enableFsInstrumentation is incompatible with Edge... disabling now.',
				)

				env.enableFsInstrumentation = false
			}

			H.initEdge(request, env, event)

			try {
				const response = await H.runWithHeaders(
					`${request.method?.toUpperCase()} - ${request.url}`,
					request.headers as any,
					async () => {
						return await handler(request, event)
					},
				)

				H.sendResponse(response)

				return response
			} catch (error) {
				const { secureSessionId, requestId } = H.parseHeaders(
					request.headers as any,
				)
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

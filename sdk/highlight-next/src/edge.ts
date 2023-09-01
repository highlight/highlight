import type { WorkersSDK } from '@highlight-run/opentelemetry-sdk-workers'
import {
	H as CloudflareH,
	HighlightEnv as CloudflareHighlightEnv,
} from '@highlight-run/cloudflare'
import type { ExecutionContext } from '@cloudflare/workers-types'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'
import type { NextFetchEvent, NextRequest } from 'next/server'

export type HighlightEnv = CloudflareHighlightEnv

type EdgeHandler = (
	request: NextRequest,
	event: NextFetchEvent,
) => Promise<Response>

type ExtendedExecutionContext = ExecutionContext & {
	__waitUntilTimer?: ReturnType<typeof setInterval>
	__waitUntilPromises?: Promise<void>[]
}

interface HighlightInterface {
	init: (
		request: Request,
		env: HighlightEnv,
		ctx: ExtendedExecutionContext,
	) => WorkersSDK
	consumeError: (error: Error) => void
	sendResponse: (response: Response) => void
	setAttributes: (attributes: ResourceAttributes) => void
}

export const H: HighlightInterface = {
	...CloudflareH,
	init: function init(
		request: Request,
		env: HighlightEnv,
		ctx: ExtendedExecutionContext,
	) {
		polyfillWaitUntil(ctx)

		return CloudflareH.init(request, env, ctx)
	},
}

function polyfillWaitUntil(ctx: ExtendedExecutionContext) {
	if (typeof ctx.waitUntil !== 'function') {
		if (!Array.isArray(ctx.__waitUntilPromises)) {
			ctx.__waitUntilPromises = []
		}

		ctx.waitUntil = function waitUntil(promise: Promise<void>) {
			ctx.__waitUntilPromises!.push(promise)
			ctx.__waitUntilTimer = setInterval(() => {
				Promise.allSettled(ctx.__waitUntilPromises || []).then(() => {
					if (ctx.__waitUntilTimer) {
						clearInterval(ctx.__waitUntilTimer)
						ctx.__waitUntilTimer = undefined
					}
				})
			}, 200)
		}
	}
}

export function Highlight(env: HighlightEnv) {
	return function withHighlight(handler: EdgeHandler) {
		return async function (request: NextRequest, event: NextFetchEvent) {
			H.init(request, env, event)

			try {
				const response = await handler(request, event)

				H.sendResponse(response)

				return response
			} catch (error) {
				if (error instanceof Error) {
					H.consumeError(error)
				}

				throw error
			}
		}
	}
}

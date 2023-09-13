import type { WorkersSDK } from '@highlight-run/opentelemetry-sdk-workers'
import {
	H as CloudflareH,
	HighlightEnv as CloudflareHighlightEnv,
} from '@highlight-run/cloudflare'
import type { ExecutionContext } from '@cloudflare/workers-types'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'
import type { NextFetchEvent, NextRequest } from 'next/server'

export type HighlightEnv = {
	projectId: string
	otlpEndpoint?: string
	serviceName?: string
}

type EdgeHandler = (
	request: NextRequest,
	event: NextFetchEvent,
) => Promise<Response>

type ExtendedExecutionContext = ExecutionContext & {
	__waitUntilTimer?: ReturnType<typeof setInterval>
	__waitUntilPromises?: Promise<void>[]
	waitUntilFinished?: () => Promise<void>
}

interface HighlightInterface {
	init: (
		request: Request,
		env: HighlightEnv,
		ctx: ExtendedExecutionContext,
		serviceName?: string,
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

		const cloudflareEnv: CloudflareHighlightEnv = {
			HIGHLIGHT_PROJECT_ID: env.projectId,
			HIGHLIGHT_OTLP_ENDPOINT: env.otlpEndpoint,
		}

		return CloudflareH.init(request, cloudflareEnv, ctx, env.serviceName)
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

	ctx.waitUntilFinished = async function waitUntilFinished() {
		if (ctx.__waitUntilPromises) {
			await Promise.allSettled(ctx.__waitUntilPromises)
		}
	}
}

export function Highlight(env: HighlightEnv) {
	return function withHighlight(handler: EdgeHandler) {
		return async function (
			request: NextRequest,
			event: NextFetchEvent & ExtendedExecutionContext,
		) {
			H.init(request, env, event)

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

import type { WorkersSDK } from '@highlight-run/opentelemetry-sdk-workers'
import {
	H as Highlight,
	HighlightEnv as CloudflareHighlightEnv,
} from '@highlight-run/cloudflare'
import type { ExecutionContext } from '@cloudflare/workers-types'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'

export type HighlightEnv = CloudflareHighlightEnv
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
	init: function init(
		request: Request,
		env: HighlightEnv,
		ctx: ExtendedExecutionContext,
	) {
		console.log(Object.keys(self))

		polyfillWaitUntil(ctx)

		return Highlight.init(request, env, ctx)
	},
	consumeError: function consumeError(
		...args: Parameters<typeof Highlight.consumeError>
	) {
		return Highlight.consumeError(...args)
	},
	sendResponse: function sendResponse(
		...args: Parameters<typeof Highlight.sendResponse>
	) {
		return Highlight.sendResponse(...args)
	},
	setAttributes: function setAttributes(
		...args: Parameters<typeof Highlight.setAttributes>
	) {
		return Highlight.setAttributes(...args)
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
				console.log('waitUntil timer', ctx.__waitUntilPromises?.length)
				Promise.allSettled(ctx.__waitUntilPromises || []).then(() => {
					if (ctx.__waitUntilTimer) {
						console.log('💘💘💘clearInterval')
						clearInterval(ctx.__waitUntilTimer)
						ctx.__waitUntilTimer = undefined
					}
				})
			}, 5000)
		}
	}
}

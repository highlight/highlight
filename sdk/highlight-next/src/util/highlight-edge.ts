import {
	H as CloudflareH,
	HighlightEnv as CloudflareHighlightEnv,
	extractRequestMetadata,
} from '@highlight-run/cloudflare'
import type { NodeOptions } from '@highlight-run/node'
import type { ExecutionContext } from '@cloudflare/workers-types'
import { HighlightInterface, Metric, RequestMetadata } from './types'

export type HighlightEnv = NodeOptions

type ExtendedExecutionContext = ExecutionContext & {
	__waitUntilTimer?: ReturnType<typeof setInterval>
	__waitUntilPromises?: Promise<void>[]
	waitUntilFinished?: () => Promise<void>
}

let globalRequestMetadata: RequestMetadata = {
	secureSessionId: '',
	requestId: '',
}
let executionContext: ExtendedExecutionContext

export const H: HighlightInterface = {
	...CloudflareH,
	init: (_: HighlightEnv) => {
		throw new Error(
			'H.init is not supported by the Edge runtime. Try H.initEdge instead.',
		)
	},
	isInitialized: () => CloudflareH.isInitialized(),
	initEdge: function init(
		request: Request,
		env: HighlightEnv,
		ctx: ExtendedExecutionContext,
	) {
		polyfillWaitUntil(ctx)

		executionContext = ctx

		const cloudflareEnv: CloudflareHighlightEnv = {
			HIGHLIGHT_PROJECT_ID: env.projectID,
			HIGHLIGHT_OTLP_ENDPOINT: env.otlpEndpoint,
		}

		if (env.serviceVersion) {
			console.warn(
				'Highlight does not support serviceVersion on Cloudflare Workers',
			)
		}

		if (env.enableFsInstrumentation) {
			console.warn(
				'Highlight does not support enableFsInstrumentation on Cloudflare Workers',
			)
		}

		globalRequestMetadata = extractRequestMetadata(request)

		return CloudflareH.init(request, cloudflareEnv, ctx, env.serviceName)
	},
	metrics: (metrics: Metric[], requestMetadata?: RequestMetadata) => {
		const localRequestMetadata = requestMetadata || globalRequestMetadata

		if (!localRequestMetadata.secureSessionId) {
			return console.warn(
				'H.metrics session could not be inferred the handler context. Consider passing the request metadata explicitly as a second argument to this function.',
			)
		}

		for (const m of metrics) {
			CloudflareH.recordMetric({ ...localRequestMetadata, ...m })
		}
	},
	consumeAndFlush: async (error: Error) => {
		CloudflareH.consumeError(error)

		if (executionContext?.waitUntilFinished) {
			await executionContext.waitUntilFinished()
		}
	},
	stop: async () => {
		throw new Error('H.stop is not supported by the Edge runtime.')
	},
	flush: async () => {
		throw new Error(
			'H.flush is not supported by the Edge runtime. try H.consumeAndFlush instead.',
		)
	},
	recordMetric: (
		secureSessionId: string,
		name: string,
		value: number,
		requestId: string,
		tags?: {
			name: string
			value: string
		}[],
	) => {
		return CloudflareH.recordMetric({
			secureSessionId,
			name,
			value,
			requestId,
			tags,
		})
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

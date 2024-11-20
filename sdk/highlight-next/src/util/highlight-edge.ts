import {
	H as CloudflareH,
	HighlightEnv as CloudflareHighlightEnv,
} from '@highlight-run/cloudflare'
import type { HighlightContext, NodeOptions } from '@highlight-run/node'
import { IncomingHttpHeaders } from 'http'
import {
	ExtendedExecutionContext,
	HIGHLIGHT_REQUEST_HEADER,
	HighlightInterface,
	Metric,
} from './types'

export type HighlightEnv = NodeOptions

let executionContext: ExtendedExecutionContext

let globalHighlightContext: HighlightContext = {
	secureSessionId: '',
	requestId: '',
}

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

		const headers: { [key: string]: string } = {}
		request.headers.forEach((value, key) => {
			headers[key] = value
		})

		setHeaders(headers)

		return CloudflareH.init(request, cloudflareEnv, ctx, env.serviceName)
	},
	metrics: function (metrics: Metric[], highlightContext?: HighlightContext) {
		const localHighlightContext = highlightContext ?? this.parseHeaders({})

		if (!localHighlightContext.secureSessionId) {
			return console.warn(
				'H.metrics session could not be inferred the handler context. Consider passing the request metadata explicitly as a second argument to this function.',
			)
		}

		for (const m of metrics) {
			if (
				localHighlightContext.secureSessionId &&
				localHighlightContext.requestId
			) {
				CloudflareH.recordMetric({
					secureSessionId: localHighlightContext.secureSessionId,
					requestId: localHighlightContext.requestId,
					...m,
				})
			}
		}
	},
	flush: async () => {
		if (executionContext?.waitUntilFinished) {
			await executionContext.waitUntilFinished()
		}
	},
	consumeAndFlush: async function (error: Error) {
		CloudflareH.consumeError(error)
		await this.flush()
	},
	stop: async () => {
		throw new Error('H.stop is not supported by the Edge runtime.')
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
	parseHeaders(
		headers: Headers | IncomingHttpHeaders | undefined,
	): HighlightContext {
		const highlightCtx = globalHighlightContext
		if (highlightCtx?.secureSessionId && highlightCtx?.requestId) {
			return highlightCtx
		} else if (headers) {
			return parseHeaders(headers)
		}

		return { secureSessionId: undefined, requestId: undefined }
	},
	async runWithHeaders<T>(
		name: string,
		headers: Headers | IncomingHttpHeaders,
		cb: () => T,
		options?: any,
	) {
		headers && setHeaders(headers)

		return cb()
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

function setHeaders(headers: Headers | IncomingHttpHeaders) {
	const highlightCtx = parseHeaders(headers)
	if (highlightCtx) {
		globalHighlightContext = highlightCtx
	}

	return highlightCtx
}

function parseHeaders(headers: IncomingHttpHeaders | Headers) {
	let requestHeaders: IncomingHttpHeaders = {}
	if (headers instanceof Headers) {
		headers.forEach((k, v) => (requestHeaders[k] = v))
	} else {
		requestHeaders = headers
	}

	if (requestHeaders[HIGHLIGHT_REQUEST_HEADER]) {
		const [secureSessionId, requestId] =
			`${requestHeaders[HIGHLIGHT_REQUEST_HEADER]}`.split('/')
		return { secureSessionId, requestId }
	}

	return { secureSessionId: undefined, requestId: undefined }
}

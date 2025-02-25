import {
	H as CloudflareH,
	HighlightEnv as CloudflareHighlightEnv,
} from '@highlight-run/cloudflare'
import type { HighlightContext, Metric, NodeOptions } from '@highlight-run/node'
import type { Span } from '@opentelemetry/api'
import { HighlightInterface } from './types'

export type HighlightEnv = NodeOptions

export const H: HighlightInterface = {
	...CloudflareH,
	init: (_: HighlightEnv) => {
		throw new Error(
			'H.init is not supported by the Edge runtime. Try H.initEdge instead.',
		)
	},
	isInitialized: () => CloudflareH.isInitialized(),
	initEdge: function init(env: HighlightEnv) {
		if (CloudflareH.isInitialized()) {
			return
		}

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

		return CloudflareH.init(cloudflareEnv, env.serviceName)
	},
	metrics: function (metrics: Metric[], highlightContext?: HighlightContext) {
		for (const m of metrics) {
			CloudflareH.recordMetric({
				secureSessionId: highlightContext?.secureSessionId ?? '',
				requestId: highlightContext?.requestId ?? '',
				...m,
			})
		}
	},
	flush: async () => {
		await CloudflareH.flush()
	},
	consumeAndFlush: async function (error: Error) {
		CloudflareH.consumeError(error)
		await this.flush()
	},
	stop: async () => {
		throw new Error('H.stop is not supported by the Edge runtime.')
	},
	// NB: edge runtime uses `recordMetric` for all metric types
	recordMetric: (metric: Metric) => {
		return CloudflareH.recordMetric({
			...metric,
			secureSessionId:
				metric.tags?.find((t) => t.name === 'highlight.session_id')
					?.value ?? '',
			requestId:
				metric.tags?.find((t) => t.name === 'highlight.trace_id')
					?.value ?? '',
		})
	},
	recordCount: function (metric: Metric): void {
		return this.recordMetric(metric)
	},
	recordIncr: function (metric: Omit<Metric, 'value'>): void {
		return this.recordMetric({ ...metric, value: 1 })
	},
	recordHistogram: function (metric: Metric): void {
		return this.recordMetric(metric)
	},
	recordUpDownCounter: function (metric: Metric): void {
		return this.recordMetric(metric)
	},
	async runWithHeaders<T>(
		name: string,
		headers: any,
		cb: (span: Span) => Promise<T>,
		options?: any,
	) {
		return CloudflareH.runWithHeaders(name, headers, cb, options)
	},
}

import type { Highlight, Metric, NodeOptions } from '@highlight-run/node'
import type { Attributes, SpanOptions, Span } from '@opentelemetry/api'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'

export type HighlightEnv = NodeOptions

export interface HighlightInterface {
	init: (options: NodeOptions) => Highlight
	initEdge: (env: HighlightEnv, serviceName?: string) => void
	isInitialized: () => boolean
	metrics: (metrics: Metric[]) => void
	runWithHeaders: <T>(
		name: string,
		headers: any,
		cb: (span: Span) => Promise<T>,
		options?: SpanOptions,
	) => Promise<T>
	consumeError: (
		error: Error,
		secureSessionId?: string,
		requestId?: string,
		metadata?: Attributes,
	) => void
	consumeAndFlush: (
		error: Error,
		secureSessionId?: string,
		requestId?: string,
		metadata?: Attributes,
	) => void
	setAttributes: (attributes: ResourceAttributes) => void
	recordMetric: (metric: Metric) => void
	recordCount: (metric: Metric) => void
	recordIncr: (metric: Omit<Metric, 'value'>) => void
	recordHistogram: (metric: Metric) => void
	recordUpDownCounter: (metric: Metric) => void
	stop: () => Promise<void>
	flush: () => Promise<void>
}

export const HIGHLIGHT_REQUEST_HEADER = 'x-highlight-request'

import type { ExecutionContext } from '@cloudflare/workers-types'
import type {
	Highlight,
	HighlightContext,
	NodeOptions,
} from '@highlight-run/node'
import type { WorkersSDK } from '@highlight-run/opentelemetry-sdk-workers'
import type { Attributes, SpanOptions } from '@opentelemetry/api'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'
import type { IncomingHttpHeaders } from 'http'

export type HighlightEnv = NodeOptions

export declare interface Metric {
	name: string
	value: number
	tags?: { name: string; value: string }[]
}

export type ExtendedExecutionContext = ExecutionContext & {
	__waitUntilTimer?: ReturnType<typeof setInterval>
	__waitUntilPromises?: Promise<void>[]
	waitUntilFinished?: () => Promise<void>
}

export interface HighlightInterface {
	init: (options: NodeOptions) => Highlight
	initEdge: (
		request: Request,
		env: HighlightEnv,
		ctx: ExtendedExecutionContext,
		serviceName?: string,
	) => WorkersSDK
	isInitialized: () => boolean
	metrics: (metrics: Metric[]) => void
	parseHeaders: (headers: any) => HighlightContext
	runWithHeaders: <T>(
		name: string,
		headers: any,
		cb: () => T,
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
	sendResponse: (response: Response) => void
	setAttributes: (attributes: ResourceAttributes) => void
	recordMetric: (
		secureSessionId: string,
		name: string,
		value: number,
		requestId: string,
		tags?: {
			name: string
			value: string
		}[],
	) => void
	stop: () => Promise<void>
	flush: () => Promise<void>
}

export const HIGHLIGHT_REQUEST_HEADER = 'x-highlight-request'

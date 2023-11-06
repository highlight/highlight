import type { NodeOptions } from '@highlight-run/node'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'
import type { ExecutionContext } from '@cloudflare/workers-types'
import type { WorkersSDK } from '@highlight-run/opentelemetry-sdk-workers'
import type { Attributes } from '@opentelemetry/api'
import { IncomingHttpHeaders } from 'http'

export type HighlightEnv = NodeOptions

export interface RequestMetadata {
	secureSessionId: string
	requestId: string
}

export interface HighlightGlobal {
	__HIGHLIGHT__?: RequestMetadata
}

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
	init: (options: NodeOptions) => void
	initEdge: (
		request: Request,
		env: HighlightEnv,
		ctx: ExtendedExecutionContext,
		serviceName?: string,
	) => WorkersSDK
	isInitialized: () => boolean
	metrics: (metrics: Metric[]) => void
	parseHeaders: (headers: IncomingHttpHeaders) => {
		secureSessionId: string | undefined
		requestId: string | undefined
	}
	runWithHeaders: <T>(headers: IncomingHttpHeaders, cb: () => T) => T
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

export const HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'

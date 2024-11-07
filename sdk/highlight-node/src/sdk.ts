import {
	Attributes,
	Context,
	Span as OtelSpan,
	SpanOptions,
} from '@opentelemetry/api'
import { ResourceAttributes } from '@opentelemetry/resources'
import { IncomingHttpHeaders } from 'http'
import type { Headers } from 'node-fetch'
import { Highlight } from './client'
import log from './log'
import type { HighlightContext, NodeOptions } from './types.js'

export const HIGHLIGHT_REQUEST_HEADER = 'x-highlight-request'

export interface HighlightInterface {
	init: (options: NodeOptions) => Highlight
	stop: () => Promise<void>
	isInitialized: () => boolean

	// Use parseHeaders to extract the headers from the current context or from the headers.
	parseHeaders: (headers: Headers | IncomingHttpHeaders) => HighlightContext

	// Use runWithHeaders to execute a method with a highlight context
	runWithHeaders: <T>(
		name: string,
		headers: Headers | IncomingHttpHeaders,
		cb: (span: OtelSpan) => T | Promise<T>,
		options?: SpanOptions,
	) => Promise<T>
	startWithHeaders: (
		name: string,
		headers: Headers | IncomingHttpHeaders,
		options?: SpanOptions,
	) => { span: OtelSpan; ctx: Context }

	consumeError: (
		error: Error,
		secureSessionId?: string,
		requestId?: string,
		metadata?: Attributes,
		options?: { span: OtelSpan },
	) => void
	recordMetric: (
		secureSessionId: string,
		name: string,
		value: number,
		requestId?: string,
		tags?: { name: string; value: string }[],
	) => void
	flush: () => Promise<void>
	log: (
		message: any,
		level: string,
		secureSessionId?: string | undefined,
		requestId?: string | undefined,
		metadata?: Attributes,
	) => void
	consumeAndFlush: (
		error: Error,
		secureSessionId?: string,
		requestId?: string,
		metadata?: Attributes,
	) => Promise<void>
	setAttributes: (attributes: ResourceAttributes) => void
	_debug: (...data: any[]) => void
}

let _debug: boolean = false
let highlight_obj: Highlight
export const H: HighlightInterface = {
	init: (options: NodeOptions) => {
		_debug = !!options.debug

		if (!highlight_obj) {
			try {
				highlight_obj = new Highlight(options)
			} catch (e) {
				console.warn('highlight-node init error: ', e)
			}
		}

		return highlight_obj
	},
	stop: async () => {
		if (!highlight_obj) {
			return
		}
		try {
			await highlight_obj.stop()
		} catch (e) {
			console.warn('highlight-node stop error: ', e)
		}
	},
	isInitialized: () => !!highlight_obj,
	consumeError: (
		error: Error,
		secureSessionId?: string,
		requestId?: string,
		metadata?: Attributes,
		options?: { span: OtelSpan },
	) => {
		try {
			highlight_obj.consumeCustomError(
				error,
				secureSessionId,
				requestId,
				metadata,
				options,
			)
		} catch (e) {
			console.warn('highlight-node consumeError error: ', e)
		}
	},
	recordMetric: (
		secureSessionId: string,
		name: string,
		value: number,
		requestId?: string,
		tags?: { name: string; value: string }[],
	) => {
		try {
			highlight_obj.recordMetric(
				secureSessionId,
				name,
				value,
				requestId,
				tags,
			)
		} catch (e) {
			console.warn('highlight-node recordMetric error: ', e)
		}
	},
	flush: async () => {
		try {
			await Promise.allSettled([
				highlight_obj.waitForFlush(),
				highlight_obj.flush(),
			])
		} catch (e) {
			console.warn('highlight-node flush error: ', e)
		}
	},
	log: (
		message: any,
		level: string,
		secureSessionId?: string | undefined,
		requestId?: string | undefined,
		metadata?: Attributes,
	) => {
		const o: { stack: any } = { stack: {} }
		Error.captureStackTrace(o)
		try {
			highlight_obj.log(
				new Date(),
				message,
				level,
				o.stack,
				secureSessionId,
				requestId,
				metadata,
			)
		} catch (e) {
			console.warn('highlight-node log error: ', e)
		}
	},
	parseHeaders: (headers): HighlightContext => {
		return highlight_obj.parseHeaders(headers)
	},

	runWithHeaders: (name, headers, cb, options) => {
		return highlight_obj.runWithHeaders(name, headers, cb, options)
	},
	startWithHeaders: (spanName, headers, options) => {
		return highlight_obj.startWithHeaders(spanName, headers, options)
	},
	consumeAndFlush: async function (...args) {
		try {
			this.consumeError(...args)

			await this.flush()
		} catch (e) {
			console.warn('highlight-node consumeAndFlush error: ', e)
		}
	},
	setAttributes: (attributes: ResourceAttributes) => {
		return highlight_obj.setAttributes(attributes)
	},

	_debug: (...data: any[]) => {
		if (_debug) {
			log('H', ...data)
		}
	},
}

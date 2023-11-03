import { IncomingHttpHeaders } from 'http'
import { Highlight } from '.'
import { NodeOptions } from './types.js'
import log from './log'
import { ResourceAttributes } from '@opentelemetry/resources'
import type { Attributes } from '@opentelemetry/api'

export const HIGHLIGHT_REQUEST_HEADER = 'x-highlight-request'

export interface HighlightInterface {
	init: (options: NodeOptions) => void
	stop: () => Promise<void>
	isInitialized: () => boolean
	// Use parseHeaders to extract the headers from the current context or from the headers.
	parseHeaders: (headers: IncomingHttpHeaders) => {
		secureSessionId: string | undefined
		requestId: string | undefined
	}
	// Use setHeaders to define the highlight context for the entire async request
	setHeaders: (headers: IncomingHttpHeaders) => void
	// Use runWithHeaders to execute a method with a highlight context
	runWithHeaders: <T>(headers: IncomingHttpHeaders, cb: () => T) => T
	consumeError: (
		error: Error,
		secureSessionId?: string,
		requestId?: string,
		metadata?: Attributes,
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
		try {
			highlight_obj = new Highlight(options)
		} catch (e) {
			console.warn('highlight-node init error: ', e)
		}
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
	) => {
		try {
			highlight_obj.consumeCustomError(
				error,
				secureSessionId,
				requestId,
				metadata,
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
			await highlight_obj.flush()
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
	parseHeaders: (
		headers: IncomingHttpHeaders,
	): {
		secureSessionId: string | undefined
		requestId: string | undefined
	} => {
		return highlight_obj.parseHeaders(headers)
	},
	runWithHeaders: (headers, cb) => {
		return highlight_obj.runWithHeaders(headers, cb)
	},
	setHeaders: (headers: IncomingHttpHeaders) => {
		return highlight_obj.setHeaders(headers)
	},
	consumeAndFlush: async function (...args) {
		const waitPromise = highlight_obj.waitForFlush()

		this.consumeError(...args)
		const flushPromise = this.flush()

		await Promise.allSettled([waitPromise, flushPromise])
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

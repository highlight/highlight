import { IncomingHttpHeaders } from 'http'
import { Highlight } from '.'
import { NodeOptions } from './types.js'
import log from './log'
import type { Attributes } from '@opentelemetry/api'
import { ResourceAttributes } from '@opentelemetry/resources'

export const HIGHLIGHT_REQUEST_HEADER = 'x-highlight-request'

export interface HighlightInterface {
	init: (options: NodeOptions) => void
	stop: () => Promise<void>
	isInitialized: () => boolean
	parseHeaders: (
		headers: IncomingHttpHeaders,
	) => { secureSessionId: string; requestId: string } | undefined
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
	): { secureSessionId: string; requestId: string } | undefined => {
		try {
			if (headers && headers[HIGHLIGHT_REQUEST_HEADER]) {
				const [secureSessionId, requestId] =
					`${headers[HIGHLIGHT_REQUEST_HEADER]}`.split('/')
				return { secureSessionId, requestId }
			} else {
				H._debug(
					`request headers do not contain ${HIGHLIGHT_REQUEST_HEADER}`,
				)
			}
		} catch (e) {
			console.warn('highlight-node parseHeaders error: ', e)
		}
		return undefined
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

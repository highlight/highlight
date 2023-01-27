import { NextApiHandler } from 'next'
import {
	H as NodeH,
	HIGHLIGHT_REQUEST_HEADER,
	NodeOptions,
} from '@highlight-run/node'
import { IncomingHttpHeaders } from 'http'

interface RequestMetadata {
	secureSessionId: string
	requestId: string
}

export declare interface Metric {
	name: string
	value: number
	tags?: { name: string; value: string }[]
}

export interface HighlightGlobal {
	__HIGHLIGHT__?: RequestMetadata
}

export interface HighlightInterface {
	init: (options: NodeOptions) => void
	isInitialized: () => boolean
	metrics: (metrics: Metric[]) => void
}

export const H: HighlightInterface = {
	init: (options: NodeOptions) => {
		if (!NodeH.isInitialized()) {
			NodeH.init(options)
		}
	},
	isInitialized: () => NodeH.isInitialized(),
	metrics: (metrics: Metric[], opts?: RequestMetadata) => {
		const h = (global as typeof globalThis & HighlightGlobal).__HIGHLIGHT__
		if (h && !opts) {
			opts = h
		}
		if (!opts?.secureSessionId) {
			return console.warn(
				'H.metrics session could not be inferred the handler context.',
			)
		}
		for (const m of metrics) {
			NodeH.recordMetric(
				opts.secureSessionId,
				m.name,
				m.value,
				opts.requestId,
				m.tags,
			)
		}
	},
}

declare type HasHeaders = { headers: IncomingHttpHeaders }
declare type HasStatus = { statusCode: number; statusMessage: string }
declare type ApiHandler<T extends HasHeaders, S extends HasStatus> = (
	req: T,
	res: S,
) => unknown | Promise<unknown>

export const Highlight =
	(options: NodeOptions) =>
	<T extends HasHeaders, S extends HasStatus>(
		origHandler: ApiHandler<T, S>,
	): ApiHandler<T, S> => {
		return async (req, res) => {
			if (!NodeH.isInitialized()) {
				NodeH.init(options)
			}

			const processHighlightHeaders = () => {
				if (req.headers && req.headers[HIGHLIGHT_REQUEST_HEADER]) {
					const [secureSessionId, requestId] =
						`${req.headers[HIGHLIGHT_REQUEST_HEADER]}`.split('/')
					if (secureSessionId && requestId) {
						;(
							global as typeof globalThis & HighlightGlobal
						).__HIGHLIGHT__ = { secureSessionId, requestId }
						return { secureSessionId, requestId }
					}
				}
				return { secureSessionId: undefined, requestId: undefined }
			}

			// set the global __HIGHLIGHT__ variables before running the handler, so that
			// the values are available in the handler
			const { secureSessionId, requestId } = processHighlightHeaders()
			const start = new Date()
			try {
				return await origHandler(req, res)
			} catch (e) {
				NodeH.consumeEvent(secureSessionId)
				if (e instanceof Error) {
					NodeH.consumeError(e, secureSessionId, requestId)
					await NodeH.flush()
				}
				// Because we're going to finish and send the transaction before passing the error onto nextjs, it won't yet
				// have had a chance to set the status to 500, so unless we do it ourselves now, we'll incorrectly report that
				// the transaction was error-free
				res.statusCode = 500
				res.statusMessage = 'Internal Server Error'

				// We rethrow here so that nextjs can do with the error whatever it would normally do. (Sometimes "whatever it
				// would normally do" is to allow the error to bubble up to the global handlers - another reason we need to mark
				// the error as already having been captured.)
				throw e
			} finally {
				// convert ms to ns
				const delta = (new Date().getTime() - start.getTime()) * 1000000
				const { secureSessionId, requestId } = processHighlightHeaders()
				if (secureSessionId) {
					NodeH.recordMetric(
						secureSessionId,
						'latency',
						delta,
						requestId,
					)
					await NodeH.flush()
				}
			}
		}
	}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/2f2d099dcc668f12109913caf36097f73a1bc966/packages/nextjs/src/utils/withSentry.ts

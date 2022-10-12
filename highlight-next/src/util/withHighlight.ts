import { NextApiHandler } from 'next'
import { H, HIGHLIGHT_REQUEST_HEADER, NodeOptions } from '@highlight-run/node'

export interface HighlightGlobal {
	__HIGHLIGHT__?: {
		secureSessionId: string
		requestId: string
	}
}

export const Highlight =
	(options: NodeOptions = {}) =>
	<T>(origHandler: NextApiHandler<T>): NextApiHandler<T> => {
		return async (req, res) => {
			const processHighlightHeaders = () => {
				if (req.headers && req.headers[HIGHLIGHT_REQUEST_HEADER]) {
					const [secureSessionId, requestId] =
						`${req.headers[HIGHLIGHT_REQUEST_HEADER]}`.split('/')
					if (secureSessionId && requestId) {
						if (!H.isInitialized()) {
							H.init(options)
						}
						;(
							global as typeof globalThis & HighlightGlobal
						).__HIGHLIGHT__ = { secureSessionId, requestId }
						return { secureSessionId, requestId }
					}
				}
				return { secureSessionId: undefined, requestId: undefined }
			}

			const start = new Date()
			try {
				return (await origHandler(req, res)) as T
			} catch (e) {
				const { secureSessionId, requestId } = processHighlightHeaders()
				if (secureSessionId && requestId) {
					H.consumeEvent(secureSessionId)
					if (e instanceof Error) {
						H.consumeError(e, secureSessionId, requestId)
						H.flush()
					}
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
					H.recordMetric(secureSessionId, 'latency', delta, requestId)
					H.flush()
				}
			}
		}
	}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/2f2d099dcc668f12109913caf36097f73a1bc966/packages/nextjs/src/utils/withSentry.ts

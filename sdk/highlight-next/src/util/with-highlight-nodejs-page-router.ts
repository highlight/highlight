import { NodeOptions } from '@highlight-run/node'
import { H } from './highlight-node'

import { IncomingHttpHeaders } from 'http'

export declare type HasHeaders = { headers: IncomingHttpHeaders }
export declare type HasStatus = { statusCode: number; statusMessage: string }
export declare type ApiHandler<T extends HasHeaders, S extends HasStatus> = (
	req: T,
	res: S,
) => unknown | Promise<unknown>

export const Highlight =
	(options: NodeOptions) =>
	<T extends HasHeaders, S extends HasStatus>(
		origHandler: ApiHandler<T, S>,
	): ApiHandler<T, S> => {
		H.init(options)
		return async (req, res) => {
			const { secureSessionId, requestId } = H.parseHeaders(req.headers)
			const start = new Date()
			try {
				return await H.runWithHeaders(req.headers, async () => {
					return await origHandler(req, res)
				})
			} catch (e) {
				if (e instanceof Error) {
					H.consumeAndFlush(e, secureSessionId, requestId)
				}
				// Because we're going to finish and send the transaction before passing the error onto nextjs, it won't yet
				// have had a chance to set the status to 500, so unless we do it ourselves now, we'll incorrectly report that
				// the transaction was error-free
				res.statusCode = 500
				res.statusMessage = 'Internal Server Error'

				// We rethrow here so that nextjs can do with the error whatever it would normally do. (Sometimes "whatever it
				// would normally do" is to allow the error to bubble up to the global handlers - another reason we need to mark
				// the error as already having been captured.)
				await H.stop()
				throw e
			} finally {
				// convert ms to ns
				const delta = (new Date().getTime() - start.getTime()) * 1000000
				if (secureSessionId && requestId) {
					H.recordMetric(secureSessionId, 'latency', delta, requestId)
					await H.flush()
				}
			}
		}
	}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/2f2d099dcc668f12109913caf36097f73a1bc966/packages/nextjs/src/utils/withSentry.ts

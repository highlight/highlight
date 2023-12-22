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
		originalHandler: ApiHandler<T, S>,
	): ApiHandler<T, S> => {
		const NodeH = H.init(options)

		return async (req, res) => {
			if (!NodeH) throw new Error('Highlight not initialized')

			const start = new Date()

			try {
				const result = await H.runWithHeaders(req.headers, async () =>
					originalHandler(req, res),
				)

				recordLatency()

				return result
			} catch (e) {
				res.statusCode = 500
				res.statusMessage = 'Internal Server Error'

				recordLatency()

				throw e
			}

			function recordLatency() {
				// convert ms to ns
				const delta = (new Date().getTime() - start.getTime()) * 1000000
				const { secureSessionId, requestId } = NodeH.parseHeaders(
					req.headers,
				)

				if (secureSessionId && requestId) {
					H.recordMetric(secureSessionId, 'latency', delta, requestId)
				}
			}
		}
	}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/2f2d099dcc668f12109913caf36097f73a1bc966/packages/nextjs/src/utils/withSentry.ts

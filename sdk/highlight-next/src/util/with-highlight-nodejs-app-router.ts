import type { NextRequest } from 'next/server'
import { H, NodeOptions } from '@highlight-run/node'

type NextContext = { params: Record<string, string> }
type NextHandler<Body = unknown> = (
	request: NextRequest,
	context: NextContext,
) => Promise<Response>

export function Highlight(options: NodeOptions) {
	const NodeH = H.init(options)

	return (originalHandler: NextHandler) =>
		async (request: NextRequest, context: NextContext) => {
			if (!NodeH) throw new Error('Highlight not initialized')

			const start = new Date()

			try {
				return await H.runWithHeaders<Promise<Response>>(
					`${request.method?.toUpperCase()} - ${request.url}`,
					request.headers as any,
					async () => originalHandler(request, context),
				)
			} catch (e) {
				throw e
			} finally {
				recordLatency()
			}

			function recordLatency() {
				// convert ms to ns
				const delta = (new Date().getTime() - start.getTime()) * 1000000
				const { secureSessionId, requestId } = NodeH.parseHeaders(
					request.headers as any,
				)

				if (secureSessionId && requestId) {
					H.recordMetric(secureSessionId, 'latency', delta, requestId)
				}
			}
		}
}

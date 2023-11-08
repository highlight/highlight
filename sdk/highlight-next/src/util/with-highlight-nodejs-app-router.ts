import type { NextRequest } from 'next/server'

import { H, NodeOptions } from '@highlight-run/node'
import { IncomingHttpHeaders } from 'http'

type NextContext = { params: Record<string, string> }
type NextHandler<Body = unknown> = (
	request: NextRequest,
	context: NextContext,
) => Promise<Response>

export function Highlight(options: NodeOptions) {
	return (originalHandler: NextHandler) =>
		async (request: NextRequest, context: NextContext) => {
			const headers: IncomingHttpHeaders = {}
			request.headers.forEach((value, key) => (headers[key] = value))
			try {
				H.init(options)

				// Must await originalHandler to catch the error at this level
				return await H.runWithHeaders(headers, async () => {
					return await originalHandler(request, context)
				})
			} catch (error) {
				const { secureSessionId, requestId } = H.parseHeaders(headers)

				if (error instanceof Error) {
					await H.consumeAndFlush(error, secureSessionId, requestId)
				}

				await H.stop()

				throw error
			}
		}
}

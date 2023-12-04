import type { NextRequest } from 'next/server'

import { H, parseHeaders, NodeOptions } from '@highlight-run/node'
import { IncomingHttpHeaders } from 'http'

type NextContext = { params: Record<string, string> }
type NextHandler<Body = unknown> = (
	request: NextRequest,
	context: NextContext,
	highlight: HighlightInitReturnType,
) => Promise<Response>
type HighlightInitReturnType = ReturnType<typeof H.init>

export function Highlight(options: NodeOptions) {
	const NodeH = H.init(options)

	return (originalHandler: NextHandler) =>
		async (request: NextRequest, context: NextContext) => {
			if (!NodeH) throw new Error('Highlight not initialized')

			const { secureSessionId, requestId } = NodeH?.setHeaders(
				request.headers,
			)

			try {
				return await H.runWithHeaders<Promise<Response>>(
					request.headers,
					async () => {
						return new Promise<Response>((resolve, reject) => {
							NodeH?.tracer.startActiveSpan(
								'with-highlight-nodejs-app-router',
								async (span) => {
									try {
										const result = await originalHandler(
											request,
											context,
											NodeH,
										)

										span?.end()

										await NodeH?.flush()

										return resolve(result)
									} catch (error) {
										reject(error)
									}
								},
							)
						})
					},
				)
			} catch (error) {
				if (error instanceof Error) {
					await H.consumeAndFlush(error, secureSessionId, requestId)
				}

				await H.stop()

				throw error
			}
		}
}

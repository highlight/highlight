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

let NodeH: HighlightInitReturnType

export function Highlight(options: NodeOptions) {
	H.init(options)
	return (originalHandler: NextHandler) =>
		async (request: NextRequest, context: NextContext) => {
			try {
				if (!NodeH) {
					const { secureSessionId, requestId } = parseHeaders(
						request.headers,
					)
					const attributes = {
						...(options.attributes || {}),
						['highlight.session_id']: secureSessionId,
						['highlight.trace_id']: requestId,
					}

					NodeH = H.init({ ...options, attributes })
				}

				// Must await originalHandler to catch the error at this level
				return await H.runWithHeaders(request.headers, async () => {
					return new Promise((resolve, reject) => {
						NodeH?.tracer.startActiveSpan(
							'highlight-ctx',
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
				})
			} catch (error) {
				const { secureSessionId, requestId } = H.parseHeaders(
					request.headers,
				)

				if (error instanceof Error) {
					await H.consumeAndFlush(error, secureSessionId, requestId)
				}

				await H.stop()

				throw error
			}
		}
}

import { NextRequest, NextResponse } from 'next/server'

import {
	HIGHLIGHT_REQUEST_HEADER,
	H as NodeH,
	NodeOptions,
} from '@highlight-run/node'

type HighlightInterface = typeof NodeH
type RequestMetadata = {
	secureSessionId: string
	requestId: string
}

export const H: HighlightInterface = NodeH
export type HighlightEnv = NodeOptions

type HighlightGlobal = {
	__HIGHLIGHT__?: RequestMetadata
}

type NextContext = { params: Record<string, string> }
type NextHandler<Body = unknown> = (
	request: NextRequest,
	context: NextContext,
) => Promise<Response | NextResponse<Body>>

export function Highlight(options: NodeOptions) {
	return (originalHandler: NextHandler) =>
		async (request: NextRequest, context: NextContext) => {
			try {
				H.init(options)

				// Must await originalHandler to catch the error at this level
				return await originalHandler(request, context)
			} catch (error) {
				const { secureSessionId, requestId } =
					processHighlightHeaders(request)

				if (error instanceof Error) {
					await NodeH.consumeAndFlush(
						error,
						secureSessionId,
						requestId,
					)
				}

				await NodeH.stop()

				throw error
			}
		}
}

function processHighlightHeaders(request: NextRequest) {
	const header = request.headers.get(HIGHLIGHT_REQUEST_HEADER)

	if (header) {
		const [secureSessionId, requestId] = header.split('/')

		if (secureSessionId && requestId) {
			;(global as typeof globalThis & HighlightGlobal).__HIGHLIGHT__ = {
				secureSessionId,
				requestId,
			}

			return { secureSessionId, requestId }
		}
	}

	return { secureSessionId: undefined, requestId: undefined }
}

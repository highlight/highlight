import type { NodeOptions } from '@highlight-run/node'
import { H } from './highlight-edge'
import { ExtendedExecutionContext } from './types'

export type NextContext = {
	params: Promise<Record<string, string>>
}

export type HighlightEnv = NodeOptions

export type EdgeHandler = (
	request: Request,
	context: NextContext,
) => Promise<Response>

export function Highlight(env: HighlightEnv) {
	return function withHighlight(handler: EdgeHandler) {
		return async function (request: Request, context: NextContext) {
			if (env.enableFsInstrumentation) {
				console.warn(
					'enableFsInstrumentation is incompatible with Edge... disabling now.',
				)

				env.enableFsInstrumentation = false
			}

			// TODO(vkorolik)
			console.log('vadim', { context })
			H.initEdge(
				request,
				env,
				context as unknown as ExtendedExecutionContext,
			)

			try {
				const response = await H.runWithHeaders(
					`${request.method?.toUpperCase()} - ${request.url}`,
					request.headers as any,
					async () => {
						return await handler(request, context)
					},
				)

				H.sendResponse(response)

				return response
			} catch (error) {
				const { secureSessionId, requestId } = H.parseHeaders(
					request.headers as any,
				)
				if (error instanceof Error) {
					H.consumeError(error, secureSessionId, requestId)
				}

				throw error
			}
		}
	}
}

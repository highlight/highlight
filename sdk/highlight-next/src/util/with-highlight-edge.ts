import type { NodeOptions } from '@highlight-run/node'
import { H } from './highlight-edge'

export type NextFetchEvent = {
	params: Promise<Record<string, string>>
}
export type NextRequest = any

export type HighlightEnv = NodeOptions

export type EdgeHandler = (
	request: NextRequest,
	context: NextFetchEvent,
) => Promise<Response>

export function Highlight(env: HighlightEnv) {
	return function withHighlight(handler: EdgeHandler) {
		if (env.enableFsInstrumentation) {
			console.warn(
				'enableFsInstrumentation is incompatible with Edge... disabling now.',
			)

			env.enableFsInstrumentation = false
		}
		H.initEdge(env)
		return async function (request: NextRequest, context: NextFetchEvent) {
			try {
				return await H.runWithHeaders(
					`${request.method?.toUpperCase()} - ${request.url}`,
					request.headers,
					async (span) => {
						span.setAttribute('next.runtime', 'edge')
						return await handler(request, context)
					},
				)
			} finally {
				await H.flush()
			}
		}
	}
}

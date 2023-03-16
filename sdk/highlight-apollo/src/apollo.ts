import type {
	ApolloServerPlugin,
	BaseContext,
	GraphQLRequestContextDidEncounterErrors,
	GraphQLRequestListener,
} from '@apollo/server'
import { H, HIGHLIGHT_REQUEST_HEADER } from '@highlight-run/node'
import type { NodeOptions } from '@highlight-run/node'

export const ApolloServerHighlightPlugin = function <T extends BaseContext>(
	options: NodeOptions,
): ApolloServerPlugin<T> {
	return {
		async requestDidStart(req): Promise<GraphQLRequestListener<T> | void> {
			let secureSessionId: string | undefined
			let requestId: string | undefined
			if (req.request.http?.headers?.get(HIGHLIGHT_REQUEST_HEADER)) {
				;[secureSessionId, requestId] =
					`${req.request.http.headers?.get(
						HIGHLIGHT_REQUEST_HEADER,
					)}`.split('/')
			}
			H._debug('processError', 'extracted from headers', {
				secureSessionId,
				requestId,
			})

			if (!H.isInitialized()) {
				H.init(options)
				H._debug('initialized H in apollo server')
			}
			return {
				async didEncounterErrors(
					requestContext: GraphQLRequestContextDidEncounterErrors<T>,
				): Promise<void> {
					H.consumeEvent(secureSessionId)
					for (const error of requestContext.errors) {
						H.consumeError(error, secureSessionId, requestId)
						H._debug('consumed apollo request error', error)
					}
				},
			}
		},
	}
}

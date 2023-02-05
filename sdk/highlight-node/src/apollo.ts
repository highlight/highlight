import {
	ApolloServerPlugin,
	BaseContext,
	GraphQLRequestContextDidEncounterErrors,
	GraphQLRequestListener,
} from '@apollo/server'
import { H, HIGHLIGHT_REQUEST_HEADER } from './sdk'
import { NodeOptions } from './types'

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
			H.log('processError', 'extracted from headers', {
				secureSessionId,
				requestId,
			})

			if (!H.isInitialized()) {
				H.init(options)
				H.log('initialized H in apollo server')
			}
			return {
				async didEncounterErrors(
					requestContext: GraphQLRequestContextDidEncounterErrors<T>,
				): Promise<void> {
					H.consumeEvent(secureSessionId)
					for (const error of requestContext.errors) {
						H.consumeError(error, secureSessionId, requestId)
						H.log('consumed apollo request error', error)
					}
				},
			}
		},
	}
}

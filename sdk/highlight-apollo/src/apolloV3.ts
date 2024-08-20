import type { NodeOptions } from '@highlight-run/node'
import { H } from '@highlight-run/node'
import type {
	ApolloServerPlugin,
	BaseContext,
	GraphQLRequestContextDidEncounterErrors,
	GraphQLRequestListener,
} from 'apollo-server-plugin-base'
import { IncomingHttpHeaders } from 'http'

export const ApolloServerV3HighlightPlugin = function <T extends BaseContext>(
	options: NodeOptions,
): ApolloServerPlugin<T> {
	return {
		async requestDidStart(req): Promise<GraphQLRequestListener<T> | void> {
			if (!H.isInitialized()) {
				H.init(options)
				H._debug('initialized H in apollo server')
			}

			const headers: IncomingHttpHeaders = {}
			for (const [k, v] of req.request.http?.headers ?? []) {
				headers[k] = v
			}

			const { secureSessionId, requestId } = H.parseHeaders(headers)

			H.runWithHeaders(headers, () => {
				H._debug('processError', 'extracted from headers', {
					secureSessionId,
					requestId,
				})
			})

			return {
				async didEncounterErrors(
					requestContext: GraphQLRequestContextDidEncounterErrors<T>,
				): Promise<void> {
					for (const error of requestContext.errors) {
						H.consumeError(error, secureSessionId, requestId)
						H._debug('consumed apollo request error', error)
					}
				},
			}
		},
	}
}

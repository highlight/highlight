import { NetworkRecordingOptions } from '../../types/client'
import { FetchListener } from './utils/fetch-listener'
import { RequestResponsePair, WebSocketEvent } from './utils/models'
import { sanitizeRequest, sanitizeResponse } from './utils/network-sanitizer'
import { WebSocketListener } from './utils/ws-listener'
import { XHRListener } from './utils/xhr-listener'

export type NetworkListenerCallback = (
	requestResponsePair: RequestResponsePair,
) => void

export type WebSocketListenerCallback = (event: WebSocketEvent) => void

type NetworkListenerArguments = {
	xhrCallback: NetworkListenerCallback
	fetchCallback: NetworkListenerCallback
	wsCallback: WebSocketListenerCallback
	headersToRedact: string[]
	backendUrl: string
	tracingOrigins: boolean | (string | RegExp)[]
	urlBlocklist: string[]
	sessionSecureID: string
} & Pick<NetworkRecordingOptions, 'bodyKeysToRecord' | 'headerKeysToRecord'>

export const NetworkListener = ({
	xhrCallback,
	fetchCallback,
	wsCallback,
	headersToRedact,
	backendUrl,
	tracingOrigins,
	urlBlocklist,
	sessionSecureID,
	bodyKeysToRecord,
	headerKeysToRecord,
}: NetworkListenerArguments) => {
	const removeXHRListener = XHRListener(
		(requestResponsePair) => {
			xhrCallback(
				sanitizeRequestResponsePair(
					requestResponsePair,
					headersToRedact,
					headerKeysToRecord,
				),
			)
		},
		backendUrl,
		tracingOrigins,
		urlBlocklist,
		sessionSecureID,
		bodyKeysToRecord,
	)
	const removeFetchListener = FetchListener(
		(requestResponsePair) => {
			fetchCallback(
				sanitizeRequestResponsePair(
					requestResponsePair,
					headersToRedact,
					headerKeysToRecord,
				),
			)
		},
		backendUrl,
		tracingOrigins,
		urlBlocklist,
		sessionSecureID,
		bodyKeysToRecord,
	)
	const removeWebSocketListener = WebSocketListener((event) => {
		wsCallback(event)
	})

	return () => {
		removeXHRListener()
		removeFetchListener()
		removeWebSocketListener()
	}
}

const sanitizeRequestResponsePair = (
	{ request, response, ...rest }: RequestResponsePair,
	headersToRedact: string[],
	headersToRecord?: string[],
): RequestResponsePair => {
	return {
		request: sanitizeRequest(request, headersToRedact, headersToRecord),
		response: sanitizeResponse(response, headersToRedact, headersToRecord),
		...rest,
	}
}

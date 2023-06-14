import { NetworkRecordingOptions } from '../../types/client'
import { FetchListener } from './utils/fetch-listener'
import { RequestResponsePair } from './utils/models'
import { sanitizeRequest, sanitizeResponse } from './utils/network-sanitizer'
import {
	WebSocketListenerCallback,
	WebSocketListener,
} from './utils/web-socket-listener'
import { XHRListener } from './utils/xhr-listener'

export type NetworkListenerCallback = (
	requestResponsePair: RequestResponsePair,
) => void

type NetworkListenerArguments = {
	xhrCallback: NetworkListenerCallback
	fetchCallback: NetworkListenerCallback
	webSocketCallback: WebSocketListenerCallback
	disableWebSocketRecording: boolean
	headersToRedact: string[]
	bodyKeysToRedact: string[]
	backendUrl: string
	tracingOrigins: boolean | (string | RegExp)[]
	urlBlocklist: string[]
	sessionSecureID: string
} & Pick<NetworkRecordingOptions, 'bodyKeysToRecord' | 'headerKeysToRecord'>

export const NetworkListener = ({
	xhrCallback,
	fetchCallback,
	webSocketCallback,
	disableWebSocketRecording,
	headersToRedact,
	bodyKeysToRedact,
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
		bodyKeysToRedact,
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
		bodyKeysToRedact,
		bodyKeysToRecord,
	)

	const removeWebSocketListener = !disableWebSocketRecording
		? WebSocketListener((event) => {
				webSocketCallback(event)
		  })
		: () => {}

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

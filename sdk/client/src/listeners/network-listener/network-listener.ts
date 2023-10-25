import { NetworkRecordingOptions } from '../../types/client'
import { FetchListener } from './utils/fetch-listener'
import { RequestResponsePair } from './utils/models'
import { sanitizeResource } from './utils/network-sanitizer'
import { XHRListener } from './utils/xhr-listener'
import {
	WebSocketEventListenerCallback,
	WebSocketListener,
	WebSocketRequestListenerCallback,
} from './utils/web-socket-listener'

export type NetworkListenerCallback = (
	requestResponsePair: RequestResponsePair,
) => void

type NetworkListenerArguments = {
	xhrCallback: NetworkListenerCallback
	fetchCallback: NetworkListenerCallback
	webSocketRequestCallback: WebSocketRequestListenerCallback
	webSocketEventCallback: WebSocketEventListenerCallback
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
	webSocketRequestCallback,
	webSocketEventCallback,
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
		? WebSocketListener(
				webSocketRequestCallback,
				webSocketEventCallback,
				urlBlocklist,
		  )
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
		request: sanitizeResource(request, headersToRedact, headersToRecord),
		response: sanitizeResource(response, headersToRedact, headersToRecord),
		...rest,
	}
}

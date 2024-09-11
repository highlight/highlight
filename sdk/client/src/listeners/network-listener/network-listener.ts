import { NetworkRecordingOptions } from '../../types/client'
import { FetchListener } from './utils/fetch-listener'
import { RequestResponsePair } from './utils/models'
import {
	WebSocketEventListenerCallback,
	WebSocketListener,
	WebSocketRequestListenerCallback,
} from './utils/web-socket-listener'
import { XHRListener } from './utils/xhr-listener'

export type NetworkListenerCallback = (
	requestResponsePair: RequestResponsePair,
) => void

type NetworkListenerArguments = {
	xhrCallback: NetworkListenerCallback
	fetchCallback: NetworkListenerCallback
	webSocketRequestCallback: WebSocketRequestListenerCallback
	webSocketEventCallback: WebSocketEventListenerCallback
	disableWebSocketRecording: boolean
	bodyKeysToRedact: string[]
	backendUrl: string
	tracingOrigins: boolean | (string | RegExp)[]
	urlBlocklist: string[]
	otelEnabled: boolean
} & Pick<NetworkRecordingOptions, 'bodyKeysToRecord'>

export const NetworkListener = ({
	xhrCallback,
	fetchCallback,
	webSocketRequestCallback,
	webSocketEventCallback,
	disableWebSocketRecording,
	bodyKeysToRedact,
	backendUrl,
	tracingOrigins,
	urlBlocklist,
	bodyKeysToRecord,
	otelEnabled,
}: NetworkListenerArguments) => {
	const removeXHRListener = XHRListener(
		xhrCallback,
		backendUrl,
		tracingOrigins,
		urlBlocklist,
		bodyKeysToRedact,
		bodyKeysToRecord,
		otelEnabled,
	)
	const removeFetchListener = FetchListener(
		fetchCallback,
		backendUrl,
		tracingOrigins,
		urlBlocklist,
		bodyKeysToRedact,
		bodyKeysToRecord,
		otelEnabled,
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

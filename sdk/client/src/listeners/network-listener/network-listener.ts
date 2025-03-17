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
	highlightEndpoints: string[]
	tracingOrigins: boolean | (string | RegExp)[]
	urlBlocklist: string[]
} & Pick<NetworkRecordingOptions, 'bodyKeysToRecord'>

export const NetworkListener = ({
	xhrCallback,
	fetchCallback,
	webSocketRequestCallback,
	webSocketEventCallback,
	disableWebSocketRecording,
	bodyKeysToRedact,
	highlightEndpoints,
	tracingOrigins,
	urlBlocklist,
	bodyKeysToRecord,
}: NetworkListenerArguments) => {
	const removeXHRListener = XHRListener(
		xhrCallback,
		highlightEndpoints,
		tracingOrigins,
		urlBlocklist,
		bodyKeysToRedact,
		bodyKeysToRecord,
	)
	const removeFetchListener = FetchListener(
		fetchCallback,
		highlightEndpoints,
		tracingOrigins,
		urlBlocklist,
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

import { NetworkRecordingOptions } from '../../types/client'
import { FetchListener } from './utils/fetch-listener'
import { RequestResponsePair } from './utils/models'
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
	bodyKeysToRedact: string[]
	backendUrl: string
	tracingOrigins: boolean | (string | RegExp)[]
	urlBlocklist: string[]
	sessionSecureID: string
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
	sessionSecureID,
	bodyKeysToRecord,
}: NetworkListenerArguments) => {
	const removeXHRListener = XHRListener(
		xhrCallback,
		backendUrl,
		tracingOrigins,
		urlBlocklist,
		bodyKeysToRedact,
		bodyKeysToRecord,
	)
	const removeFetchListener = FetchListener(
		fetchCallback,
		backendUrl,
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

import { WebSocketEvent, WebSocketRequest } from '../utils/models'

export type WebSocketRequestListenerCallback = (event: WebSocketRequest) => void

export type WebSocketEventListenerCallback = (event: WebSocketEvent) => void

export type HighlightWebSocketWindow = Window & {
	/**
	 * Callback for web socket open and close events that are displayed in the network requests
	 */
	_highlightWebSocketRequestCallback: WebSocketRequestListenerCallback
	/**
	 * Callback for web socket message and error events that are displayed under the websocket requests
	 */
	_highlightWebSocketEventCallback: WebSocketEventListenerCallback
	WebSocket: any
}

declare var window: HighlightWebSocketWindow

const WebSocketListener = (
	requestCallback: WebSocketRequestListenerCallback,
	eventCallback: WebSocketEventListenerCallback,
) => {
	const initialHighlightWebSocketRequestCallback =
		window._highlightWebSocketRequestCallback
	window._highlightWebSocketRequestCallback = requestCallback

	const initialHighlightWebSocketEventCallback =
		window._highlightWebSocketEventCallback
	window._highlightWebSocketEventCallback = eventCallback

	return () => {
		window._highlightWebSocketRequestCallback =
			initialHighlightWebSocketRequestCallback
		window._highlightWebSocketEventCallback =
			initialHighlightWebSocketEventCallback
	}
}

export { WebSocketListener }

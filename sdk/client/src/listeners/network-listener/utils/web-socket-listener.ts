import { WebSocketEvent } from '../utils/models'
import type { HighlightPublicInterface } from '@highlight-run/client/src/types/types'

export type WebSocketListenerCallback = (event: WebSocketEvent) => void
export type HighlightWebSocketWindow = Window & {
	_highlightWebSocketCallback: WebSocketListenerCallback
	WebSocket: any
}

declare var window: HighlightWebSocketWindow

const WebSocketListener = (callback: WebSocketListenerCallback) => {
	const initialHighlightWebSocketCallback = window._highlightWebSocketCallback
	window._highlightWebSocketCallback = callback

	return () => {
		window._highlightWebSocketCallback = initialHighlightWebSocketCallback
	}
}

export { WebSocketListener }

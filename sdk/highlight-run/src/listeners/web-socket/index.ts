import { createNetworkRequestId } from '../../client/listeners/network-listener/utils/utils'
import type { HighlightWebSocketWindow } from '../../client/listeners/network-listener/utils/web-socket-listener'

declare var window: HighlightWebSocketWindow

const placeholderCallback = () => null

export const initializeWebSocketListener = () => {
	if (typeof window !== 'undefined') {
		// avoid initializing fetch listener more than once.
		if (typeof window._highlightWebSocketRequestCallback !== 'undefined') {
			return
		}

		window._highlightWebSocketRequestCallback = placeholderCallback
		window._highlightWebSocketEventCallback = placeholderCallback

		const WebSocketProxy = new Proxy(window.WebSocket, {
			construct(
				target,
				args: [url: string, protocols?: string | string[]],
			) {
				const [, socketId] = createNetworkRequestId()
				const webSocket = new target(...args)

				const openHandler = (event: Event) => {
					window._highlightWebSocketRequestCallback({
						socketId,
						initiatorType: 'websocket',
						type: 'open',
						name: webSocket.url,
						startTimeAbs: performance.timeOrigin + event.timeStamp,
					})
				}

				const closeHandler = (event: CloseEvent) => {
					window._highlightWebSocketRequestCallback({
						socketId,
						initiatorType: 'websocket',
						type: 'close',
						name: webSocket.url,
						responseEndAbs:
							performance.timeOrigin + event.timeStamp,
					})

					webSocket.removeEventListener('open', openHandler)
					webSocket.removeEventListener('error', errorHandler)
					webSocket.removeEventListener('message', messageHandler)
					webSocket.removeEventListener('close', closeHandler)
				}

				const messageHandler = (event: MessageEvent) => {
					const { data } = event
					const message =
						typeof data === 'string' ? event.data : undefined

					let size: number
					if (typeof data === 'string') {
						size = data.length
					} else if (data instanceof Blob) {
						size = data.size
					} else {
						size = data.byteLength || 0
					}

					window._highlightWebSocketEventCallback({
						socketId,
						type: 'received',
						name: webSocket.url,
						timeStamp: performance.timeOrigin + event.timeStamp,
						size,
						message,
					})
				}

				const errorHandler = (event: Event) => {
					window._highlightWebSocketEventCallback({
						socketId,
						type: 'error',
						name: webSocket.url,
						timeStamp: performance.timeOrigin + event.timeStamp,
						size: 0,
					})
				}

				webSocket.addEventListener('open', openHandler)
				webSocket.addEventListener('error', errorHandler)
				webSocket.addEventListener('message', messageHandler)
				webSocket.addEventListener('close', closeHandler)

				const sendProxy = new Proxy(webSocket.send, {
					apply: function (
						sendTarget,
						thisArg,
						args: [data: string | Blob | ArrayBuffer],
					) {
						const data = args[0]
						const message =
							typeof data === 'string' ? data : undefined

						let size: number
						if (typeof data === 'string') {
							size = data.length
						} else if (data instanceof Blob) {
							size = data.size
						} else {
							size = data.byteLength || 0
						}

						window._highlightWebSocketEventCallback({
							socketId,
							type: 'sent',
							name: webSocket.url,
							timeStamp:
								performance.timeOrigin + performance.now(),
							size,
							message,
						})

						sendTarget.apply(thisArg, args)
					},
				})

				webSocket.send = sendProxy

				return webSocket
			},
		})

		window.WebSocket = WebSocketProxy
	}
}

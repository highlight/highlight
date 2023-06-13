import { WebSocketEvent } from '../utils/models'
import { createNetworkRequestId } from './utils'

export type WebSocketListenerCallback = (event: WebSocketEvent) => void

const WebSocketListener = (callback: WebSocketListenerCallback) => {
	var originalWebSocket = window.WebSocket

	const WebSocketProxy = new Proxy(window.WebSocket, {
		construct(target, args: [url: string, protocols?: string | string[]]) {
			const socketId = createNetworkRequestId()
			const webSocket = new target(...args)

			const openHandler = (event: Event) => {
				callback({
					socketId,
					initiatorType: 'WebSocket',
					type: 'open',
					name: target.name,
					timeStamp: event.timeStamp,
					size: 0,
				})
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

				callback({
					socketId,
					initiatorType: 'WebSocket',
					type: 'received',
					name: target.name,
					timeStamp: event.timeStamp,
					size,
					message,
				})
			}

			const errorHandler = (event: Event) => {
				callback({
					socketId,
					initiatorType: 'WebSocket',
					type: 'error',
					name: target.name,
					timeStamp: event.timeStamp,
					size: 0,
				})
			}

			const closeHandler = (event: CloseEvent) => {
				callback({
					socketId,
					initiatorType: 'WebSocket',
					type: 'close',
					name: target.name,
					timeStamp: event.timeStamp,
					size: 0,
				})

				webSocket.removeEventListener('open', openHandler)
				webSocket.removeEventListener('error', errorHandler)
				webSocket.removeEventListener('message', messageHandler)
				webSocket.removeEventListener('close', closeHandler)
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
					const message = typeof data === 'string' ? data : undefined

					let size: number
					if (typeof data === 'string') {
						size = data.length
					} else if (data instanceof Blob) {
						size = data.size
					} else {
						size = data.byteLength || 0
					}

					callback({
						socketId,
						initiatorType: 'WebSocket',
						type: 'sent',
						name: target.name,
						timeStamp: performance.now(),
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

	return () => {
		window.WebSocket = originalWebSocket
	}
}

export { WebSocketListener }

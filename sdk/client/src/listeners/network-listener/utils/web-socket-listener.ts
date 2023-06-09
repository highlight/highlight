import { WebSocketEvent } from '../utils/models'
import { createNetworkRequestId } from './utils'

export type WebSocketListenerCallback = (event: WebSocketEvent) => void

const WebSocketListener = (callback: WebSocketListenerCallback) => {
	var originalWebSocket = window.WebSocket
	console.log('Websocket - Initialized')

	const WebSocketProxy = new Proxy(window.WebSocket, {
		construct(target, args: [url: string, protocols?: string | string[]]) {
			console.log('Websocket - Proxying connection', ...args)
			const socketId = createNetworkRequestId()
			const webSocket = new target(...args)

			// TODO(spenny): do we want a create? Can we rely on open?
			callback({
				socketId,
				type: 'create',
				size: 0,
				strData: args[0],
			})

			const openHandler = (event: Event) => {
				console.log('Websocket - Open', socketId, 0, event)
				callback({
					socketId,
					type: 'open',
					size: 0,
				})
			}

			const messageHandler = (event: MessageEvent) => {
				// TODO(spenny): forgo sending data if large and binary
				let size: number
				let strData =
					typeof event.data === 'string' ? event.data : undefined
				if (typeof event.data === 'string') {
					// TODO: Consider passing the UTF-8 byte length instead.
					size = event.data.length
				} else {
					size = event.data.byteLength || 0
				}

				console.log(
					'Websocket - Received',
					socketId,
					size,
					strData,
					event,
				)

				callback({
					socketId,
					type: 'received',
					size,
					strData,
				})
			}

			const errorHandler = (event: Event) => {
				console.log('Websocket - Error', socketId, 0, event)
				callback({
					socketId,
					type: 'error',
					size: 0,
				})
			}

			const closeHandler = (event: CloseEvent) => {
				console.log('Websocket - Close', socketId, 0, event)
				callback({
					socketId,
					type: 'close',
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
					target,
					thisArg,
					args: [
						data: string | ArrayBufferLike | Blob | ArrayBufferView,
					],
				) {
					// TODO(spenny): forgo sending data if large and binary
					// TODO(spenny): apply callback appropriately
					console.log('Websocket - Send', args)
					target.apply(thisArg, args)
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

// 	const originalSend = ws.send.bind(ws)
// 	ws.send = (data) => {
// 		// TODO(spenny): forgo sending data if large and binary
// 		let size: number
// 		let strData = typeof data === 'string' ? data : undefined
// 		if (typeof data === 'string') {
// 			// TODO: Consider passing the UTF-8 byte length instead.
// 			size = data.length
// 		} else {
// 			if (data instanceof Blob) {
// 				size = data.size
// 			} else {
// 				size = data.byteLength
// 			}
// 		}
// 		callback({
// 			socketId,
// 			type: 'sent',
// 			size,
// 			strData,
// 		})
// 		console.log('Websocket - Sent', socketId, size, strData)
// 		return originalSend(data)
// 	}

// 	return ws
// }

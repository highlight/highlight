import { WebSocketEvent } from '../utils/models'
import { createNetworkRequestId } from './utils'

export type WebSocketListenerCallback = (event: WebSocketEvent) => void

const WebSocketListener = (callback: WebSocketListenerCallback) => {
	var originalWebSocket = window.WebSocket
	console.log('Websocket - Initialized')

	function WebSocket(
		this: WebSocket,
		...args: [url: string, protocols?: string | string[]]
	) {
		const socketId = createNetworkRequestId()
		if (!(this instanceof WebSocket)) {
			// The browser will likely throw an error.
			originalWebSocket.apply(this, args)
			// If not, we do.
			throw new Error('WebSocket must be called with new')
		}
		const ws = new originalWebSocket(...args)
		// TODO(spenny): do we want a create? Can we rely on open?
		callback({
			socketId,
			type: 'create',
			size: 0,
			strData: args[0],
		})
		console.log('Websocket - Create', socketId, 0, args[0])
		ws.addEventListener('error', (event) => {
			callback({
				socketId,
				type: 'error',
				size: 0,
			})
			console.log('Websocket - Error', socketId, 0, event)
		})
		ws.addEventListener('open', (event) => {
			callback({
				socketId,
				type: 'open',
				size: 0,
			})
			console.log('Websocket - Open', socketId, 0, event)
		})
		ws.addEventListener('close', (event) => {
			callback({
				socketId,
				type: 'close',
				size: 0,
			})
			console.log('Websocket - Close', socketId, 0, event)
		})
		ws.addEventListener('message', (event) => {
			let size: number
			let strData =
				typeof event.data === 'string' ? event.data : undefined
			if (typeof event.data === 'string') {
				// TODO: Consider passing the UTF-8 byte length instead.
				size = event.data.length
			} else {
				size = event.data.byteLength || 0
			}
			callback({
				socketId,
				type: 'received',
				size,
				strData,
			})
			console.log('Websocket - Received', socketId, size, strData, event)
		})
		const originalSend = ws.send.bind(ws)
		ws.send = (data) => {
			let size: number
			let strData = typeof data === 'string' ? data : undefined
			if (typeof data === 'string') {
				// TODO: Consider passing the UTF-8 byte length instead.
				size = data.length
			} else {
				if (data instanceof Blob) {
					size = data.size
				} else {
					size = data.byteLength
				}
			}
			callback({
				socketId,
				type: 'sent',
				size,
				strData,
			})
			console.log('Websocket - Sent', socketId, size, strData)
			return originalSend(data)
		}

		return ws
	}
	WebSocket.CONNECTING = originalWebSocket.CONNECTING
	WebSocket.OPEN = originalWebSocket.OPEN
	WebSocket.CLOSING = originalWebSocket.CLOSING
	WebSocket.CLOSED = originalWebSocket.CLOSED
	WebSocket.prototype = originalWebSocket.prototype
	WebSocket.prototype.constructor = WebSocket

	// @ts-ignore
	window.WebSocket = WebSocket

	return () => {
		window.WebSocket = originalWebSocket
	}
}

export { WebSocketListener }

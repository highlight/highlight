import { WebSocketListener } from '@highlight-run/client/src/listeners/network-listener/utils/web-socket-listener'

export const initializeWebSocketListener = () => {
	if (!(typeof window === 'undefined' || typeof document === 'undefined')) {
		WebSocketListener((event) => {
			console.log('Websocket - placeholder', event)
		})
	}
}

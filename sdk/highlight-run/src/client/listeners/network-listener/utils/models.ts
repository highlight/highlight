export interface Headers {
	[key: string]: any
}

export interface Request {
	sessionSecureID: string
	id: string
	url: string
	verb: string
	headers?: Headers
	body: any
}

export interface Response {
	status: number
	headers?: { [k: string]: string }
	body: any
	/** Number of Bytes transferred over the network. */
	size?: number
}

export interface RequestResponsePair {
	request: Request
	response: Response
	/** Whether this URL matched a `urlToBlock` so the contents should not be recorded. */
	urlBlocked: boolean
}

export interface WebSocketRequest {
	socketId: string
	initiatorType: 'websocket'
	type: 'open' | 'close'
	name: string
	// provided in open event type
	startTimeAbs?: number
	// provided in close event type (may not exist)
	responseEndAbs?: number
}

export interface WebSocketEvent {
	socketId: string
	type: 'error' | 'received' | 'sent'
	name: string
	timeStamp: number
	size?: number
	message?: string
}

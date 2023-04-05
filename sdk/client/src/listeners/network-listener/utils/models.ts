export interface Headers {
	[key: string]: any
}

export interface Request {
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

export interface WebSocketEvent {
	socketId: string
	type: 'create' | 'error' | 'open' | 'close' | 'sent' | 'received'
	size: number
	/**
	 * Only set if the data is a string (i.e. not Blob or ByteBuffer).
	 *
	 * In the case of an "create" event, this will be the URL.
	 */
	strData?: string
}

import stringify from 'json-stringify-safe'

import { NetworkListenerCallback } from '../network-listener'
import { Headers, Request, RequestResponsePair, Response } from './models'
import {
	createNetworkRequestId,
	getHighlightRequestHeader,
	HIGHLIGHT_REQUEST_HEADER,
	shouldNetworkRequestBeRecorded,
	shouldNetworkRequestBeTraced,
} from './utils'

export interface BrowserXHR extends XMLHttpRequest {
	_method: string
	_url: string
	_requestHeaders: Headers
	_responseSize?: number
	_shouldRecordHeaderAndBody: boolean
	_body?: any
}

/**
 * Listens to all XMLHttpRequests made.
 */
export const XHRListener = (
	callback: NetworkListenerCallback,
	backendUrl: string,
	tracingOrigins: boolean | (string | RegExp)[],
	urlBlocklist: string[],
	bodyKeysToRedact?: string[],
	bodyKeysToRecord?: string[],
) => {
	const XHR = XMLHttpRequest.prototype

	const originalOpen = XHR.open
	const originalSend = XHR.send
	const originalSetRequestHeader = XHR.setRequestHeader

	/**
	 * When a request gets initiated, store metadata for that specific request.
	 */
	XHR.open = function (this: BrowserXHR, method: string, url: string | URL) {
		if (typeof url === 'string') {
			this._url = url
		} else {
			this._url = url.toString()
		}
		this._method = method
		this._requestHeaders = {}
		this._shouldRecordHeaderAndBody = !urlBlocklist.some((blockedUrl) =>
			this._url.toLowerCase().includes(blockedUrl),
		)

		// @ts-expect-error
		return originalOpen.apply(this, arguments)
	}

	XHR.setRequestHeader = function (
		this: BrowserXHR,
		header: string,
		value: string,
	) {
		this._requestHeaders[header] = value

		// @ts-expect-error
		return originalSetRequestHeader.apply(this, arguments)
	}

	XHR.send = function (this: BrowserXHR, postData: any) {
		if (
			!shouldNetworkRequestBeRecorded(
				this._url,
				backendUrl,
				tracingOrigins,
			)
		) {
			// @ts-expect-error
			return originalSend.apply(this, arguments)
		}

		const [sessionSecureID, requestId] = createNetworkRequestId()
		if (shouldNetworkRequestBeTraced(this._url, tracingOrigins)) {
			this.setRequestHeader(
				HIGHLIGHT_REQUEST_HEADER,
				getHighlightRequestHeader(sessionSecureID, requestId),
			)
		}

		const shouldRecordHeaderAndBody = this._shouldRecordHeaderAndBody
		const requestModel: Request = {
			sessionSecureID,
			id: requestId,
			url: this._url,
			verb: this._method,
			headers: shouldRecordHeaderAndBody ? this._requestHeaders : {},
			body: undefined,
		}

		if (shouldRecordHeaderAndBody) {
			if (postData) {
				const bodyData = getBodyData(postData, requestModel.url)
				if (bodyData) {
					this._body = bodyData
					requestModel['body'] = getBodyThatShouldBeRecorded(
						bodyData,
						bodyKeysToRedact,
						bodyKeysToRecord,
						requestModel.headers,
					)
				}
			}
		}

		// The load event for XMLHttpRequest is fired when a request completes successfully.
		this.addEventListener('load', async function () {
			const responseModel: Response = {
				status: this.status,
				headers: {},
				body: undefined,
			}

			if (shouldRecordHeaderAndBody) {
				const responseHeaders = this.getAllResponseHeaders()
				// Convert the header string into an array
				// of individual headers
				const normalizedResponseHeaders = responseHeaders
					.trim()
					.split(/[\r\n]+/)

				// Create a map of header names to values
				const headerMap: { [key: string]: any } = {}
				normalizedResponseHeaders.forEach(function (line) {
					const parts = line.split(': ')
					const header = parts.shift() as string
					headerMap[header] = parts.join(': ')
				})
				responseModel.headers = headerMap

				if (postData) {
					const bodyData = getBodyData(postData, requestModel.url)
					if (bodyData) {
						requestModel['body'] = getBodyThatShouldBeRecorded(
							bodyData,
							bodyKeysToRedact,
							bodyKeysToRecord,
							responseModel.headers,
						)
					}
				}

				if (this.responseType === '' || this.responseType === 'text') {
					responseModel['body'] = getBodyThatShouldBeRecorded(
						this.responseText,
						bodyKeysToRedact,
						bodyKeysToRecord,
						responseModel.headers,
					)
					// Each character is 8 bytes, total size is number of characters multiplied by 8.
					responseModel['size'] = this.responseText.length * 8
				} else if (this.responseType === 'blob') {
					if (this.response instanceof Blob) {
						try {
							const response = await this.response.text()

							responseModel['body'] = getBodyThatShouldBeRecorded(
								response,
								bodyKeysToRedact,
								bodyKeysToRecord,
								responseModel.headers,
							)
							responseModel['size'] = this.response.size
						} catch {}
					}
				} else {
					try {
						responseModel['body'] = getBodyThatShouldBeRecorded(
							this.response,
							bodyKeysToRedact,
							bodyKeysToRecord,
							responseModel.headers,
						)
					} catch {}
				}
			}

			const event: RequestResponsePair = {
				request: requestModel,
				response: responseModel,
				urlBlocked: !shouldRecordHeaderAndBody,
			}

			callback(event)
		})

		/**
		 * The error event happens when a network request fails. A 4xx or 5xx
		 * response will not trigger this, those will still trigger a load event.
		 * An error is if the request is blocked, some scenarios:
		 * 1. The request is blocked by an extension
		 * 2. The request is blocked by the DevTools
		 * 3. The client is offline
		 */
		this.addEventListener('error', async function () {
			const responseModel: Response = {
				status: this.status,
				headers: undefined,
				body: undefined,
			}

			const event: RequestResponsePair = {
				request: requestModel,
				response: responseModel,
				urlBlocked: false,
			}

			callback(event)
		})

		// @ts-expect-error
		return originalSend.apply(this, arguments)
	}

	return () => {
		XHR.open = originalOpen
		XHR.send = originalSend
		XHR.setRequestHeader = originalSetRequestHeader
	}
}

const getBodyData = (postData: any, url: string | undefined) => {
	if (typeof postData === 'string') {
		// TODO: This should be removed when we move recording logic from client to firstload.
		// This is only for development purposes. We don't want to send the body of pushPayload requests because it'll end up being recursive.
		if (
			!(
				(url?.includes('localhost') ||
					url?.includes('highlight.run')) &&
				postData.includes('pushPayload')
			)
		) {
			return postData
		}
	} else if (
		typeof postData === 'object' ||
		typeof postData === 'number' ||
		typeof postData === 'boolean'
	) {
		return stringify(postData)
	}

	return null
}

const DEFAULT_BODY_LIMIT = 64 * 1024 // KB
const BODY_SIZE_LIMITS = {
	'application/json': 64 * 1024 * 1024, // MB
	'text/plain': 64 * 1024 * 1024, // MB
} as const

export const getBodyThatShouldBeRecorded = (
	bodyData: any,
	bodyKeysToRedact?: string[],
	bodyKeysToRecord?: string[],
	headers?: Headers | { [key: string]: string },
) => {
	let bodyLimit: number = DEFAULT_BODY_LIMIT
	if (headers) {
		let contentType: string = ''
		if (typeof headers['get'] === 'function') {
			contentType = headers.get('content-type') ?? ''
		} else {
			contentType = headers['content-type'] ?? ''
		}
		try {
			contentType = contentType.split(';')[0]
		} catch {}
		bodyLimit =
			BODY_SIZE_LIMITS[contentType as keyof typeof BODY_SIZE_LIMITS] ??
			DEFAULT_BODY_LIMIT
	}

	if (bodyData) {
		if (bodyKeysToRedact) {
			try {
				const json = JSON.parse(bodyData)

				if (Array.isArray(json)) {
					json.forEach((element) => {
						Object.keys(element).forEach((key) => {
							if (
								bodyKeysToRedact.includes(
									key.toLocaleLowerCase(),
								)
							) {
								element[key] = '[REDACTED]'
							}
						})
					})
				} else {
					Object.keys(json).forEach((key) => {
						if (
							bodyKeysToRedact.includes(key.toLocaleLowerCase())
						) {
							json[key] = '[REDACTED]'
						}
					})
				}

				bodyData = JSON.stringify(json)
			} catch {}
		}

		if (bodyKeysToRecord) {
			try {
				const json = JSON.parse(bodyData)

				Object.keys(json).forEach((key) => {
					if (!bodyKeysToRecord.includes(key.toLocaleLowerCase())) {
						json[key] = '[REDACTED]'
					}
				})

				bodyData = JSON.stringify(json)
			} catch {}
		}
	}

	try {
		bodyData = bodyData.slice(0, bodyLimit)
	} catch {}

	return bodyData
}

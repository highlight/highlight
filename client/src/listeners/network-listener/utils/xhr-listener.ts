import { NetworkListenerCallback } from '../network-listener'
import { Headers, Request, RequestResponsePair, Response } from './models'
import {
	createNetworkRequestId,
	getHighlightRequestHeader,
	HIGHLIGHT_REQUEST_HEADER,
	shouldNetworkRequestBeRecorded,
	shouldNetworkRequestBeTraced,
} from './utils'

interface BrowserXHR extends XMLHttpRequest {
	_method: string
	_url: string
	_requestHeaders: Headers
	_responseSize?: number
	_shouldRecordHeaderAndBody: boolean
}

/**
 * Listens to all XMLHttpRequests made.
 */
export const XHRListener = (
	callback: NetworkListenerCallback,
	backendUrl: string,
	tracingOrigins: boolean | (string | RegExp)[],
	urlBlocklist: string[],
	sessionSecureID: string,
	bodyKeysToRecord?: string[],
) => {
	const XHR = XMLHttpRequest.prototype

	const originalOpen = XHR.open
	const originalSend = XHR.send
	const originalSetRequestHeader = XHR.setRequestHeader

	/**
	 * When a request gets initiated, store metadata for that specific request.
	 */
	XHR.open = function (this: BrowserXHR, method: string, url: string) {
		this._method = method
		this._url = url
		this._requestHeaders = {}
		this._shouldRecordHeaderAndBody = !urlBlocklist.some((blockedUrl) =>
			url.toLowerCase().includes(blockedUrl),
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

		const requestId = createNetworkRequestId()
		if (shouldNetworkRequestBeTraced(this._url, tracingOrigins)) {
			this.setRequestHeader(
				HIGHLIGHT_REQUEST_HEADER,
				getHighlightRequestHeader(sessionSecureID, requestId),
			)
		}

		const shouldRecordHeaderAndBody = this._shouldRecordHeaderAndBody
		const requestModel: Request = {
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
					requestModel['body'] = getBodyThatShouldBeRecorded(
						bodyData,
						bodyKeysToRecord,
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
				if (postData) {
					const bodyData = getBodyData(postData, requestModel.url)
					if (bodyData) {
						requestModel['body'] = getBodyThatShouldBeRecorded(
							bodyData,
							bodyKeysToRecord,
						)
					}
				}

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

				if (this.responseType === '' || this.responseType === 'text') {
					responseModel['body'] = getBodyThatShouldBeRecorded(
						this.responseText,
						bodyKeysToRecord,
					)
					// Each character is 8 bytes, total size is number of characters multiplied by 8.
					responseModel['size'] = this.responseText.length * 8
				} else if (this.responseType === 'blob') {
					const blob = this.response as Blob
					const response = await blob.text()
					responseModel['body'] = getBodyThatShouldBeRecorded(
						response,
						bodyKeysToRecord,
					)
					responseModel['size'] = blob.size
				} else {
					try {
						responseModel['body'] = getBodyThatShouldBeRecorded(
							this.response,
							bodyKeysToRecord,
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
		return postData.toString()
	}

	return null
}

export const getBodyThatShouldBeRecorded = (
	bodyData: any,
	bodyKeysToRecord?: string[],
) => {
	if (!bodyKeysToRecord || !bodyData) {
		return bodyData
	}

	try {
		const json = JSON.parse(bodyData)

		Object.keys(json).forEach((header) => {
			if (!bodyKeysToRecord.includes(header.toLocaleLowerCase())) {
				json[header] = '[REDACTED]'
			}
		})

		return JSON.stringify(json)
	} catch {}

	return bodyData
}

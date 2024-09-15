import {
	Request as HighlightRequest,
	Response as HighlightResponse,
	RequestResponsePair,
} from './models'
import {
	HIGHLIGHT_REQUEST_HEADER,
	createNetworkRequestId,
	getHighlightRequestHeader,
	shouldNetworkRequestBeRecorded,
	shouldNetworkRequestBeTraced,
} from './utils'

import { NetworkListenerCallback } from '../network-listener'
import { getBodyThatShouldBeRecorded } from './xhr-listener'

export interface HighlightFetchWindow extends WindowOrWorkerGlobalScope {
	_originalFetch: WindowOrWorkerGlobalScope['fetch']
	_highlightFetchPatch: WindowOrWorkerGlobalScope['fetch']
	_fetchProxy: WindowOrWorkerGlobalScope['fetch']
}

declare var window: HighlightFetchWindow & Window

export const FetchListener = (
	callback: NetworkListenerCallback,
	highlightEndpoints: string[],
	tracingOrigins: boolean | (string | RegExp)[],
	urlBlocklist: string[],
	bodyKeysToRedact: string[],
	bodyKeysToRecord: string[] | undefined,
) => {
	const originalFetch = window._fetchProxy

	window._fetchProxy = function (input, init) {
		const { method, url } = getFetchRequestProperties(input, init)
		if (
			!shouldNetworkRequestBeRecorded(
				url,
				highlightEndpoints,
				tracingOrigins,
			)
		) {
			return originalFetch.call(this, input, init)
		}

		const [sessionSecureID, requestId] = createNetworkRequestId()
		if (shouldNetworkRequestBeTraced(url, tracingOrigins, urlBlocklist)) {
			init = init || {}
			// Pre-existing headers could be one of three different formats; this reads all of them.
			let headers = new Headers(init.headers)

			if (input instanceof Request) {
				;[...input.headers].forEach(([key, value]) =>
					headers.set(key, value),
				)
			}

			headers.set(
				HIGHLIGHT_REQUEST_HEADER,
				getHighlightRequestHeader(sessionSecureID, requestId),
			)

			init.headers = Object.fromEntries(headers.entries())
		}

		const request: HighlightRequest = {
			sessionSecureID,
			id: requestId,
			headers: {},
			body: undefined,
			url,
			verb: method,
		}
		const shouldRecordHeaderAndBody = !urlBlocklist.some((blockedUrl) =>
			url.toLowerCase().includes(blockedUrl),
		)
		if (shouldRecordHeaderAndBody) {
			request.headers = Object.fromEntries(
				new Headers(init?.headers).entries(),
			)
			request.body = getBodyThatShouldBeRecorded(
				init?.body,
				bodyKeysToRedact,
				bodyKeysToRecord,
				init?.headers,
			)
		}

		let responsePromise = originalFetch.call(this, input, init)
		logRequest(
			responsePromise,
			request,
			callback,
			shouldRecordHeaderAndBody,
			bodyKeysToRedact,
			bodyKeysToRecord,
		)
		return responsePromise
	}

	return () => {
		window._fetchProxy = originalFetch
	}
}

export const getFetchRequestProperties = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => {
	const method =
		(init && init.method) ||
		(typeof input === 'object' && 'method' in input && input.method) ||
		'GET'
	let url: string
	if (typeof input === 'object') {
		if ('url' in input && input.url) {
			url = input.url
		} else {
			url = input.toString()
		}
	} else {
		url = input
	}

	return {
		method,
		url,
	}
}

/** Logs the Fetch request once it resolves. */
const logRequest = (
	responsePromise: Promise<Response>,
	requestPayload: HighlightRequest,
	callback: NetworkListenerCallback,
	shouldRecordHeaderAndBody: boolean,
	bodyKeysToRedact?: string[],
	bodyKeysToRecord?: string[],
) => {
	const onPromiseResolveHandler = async (response: Response | Error) => {
		let responsePayload: HighlightResponse = {
			body: undefined,
			headers: undefined,
			status: 0,
			size: 0,
		}
		let requestHandled = false
		let urlBlocked = !shouldRecordHeaderAndBody

		if ('stack' in response || response instanceof Error) {
			responsePayload = {
				...responsePayload,
				body: response.message,
				status: 0,
				size: undefined,
			}

			requestHandled = true
		} else if ('status' in response) {
			responsePayload = {
				...responsePayload,
				status: response.status,
			}

			if (shouldRecordHeaderAndBody) {
				responsePayload.body = await getResponseBody(
					response,
					bodyKeysToRecord,
					bodyKeysToRedact,
				)
				// response.headers must be used as an iterable via `.entries()` to get headers
				responsePayload.headers = Object.fromEntries(
					response.headers.entries(),
				)
				responsePayload.size = responsePayload.body.length * 8
			}

			if (
				response.type === 'opaque' ||
				response.type === 'opaqueredirect'
			) {
				urlBlocked = true
				responsePayload = {
					...responsePayload,
					body: 'CORS blocked request',
				}
			}

			requestHandled = true
		}

		if (requestHandled) {
			const event: RequestResponsePair = {
				request: requestPayload,
				response: responsePayload,
				urlBlocked,
			}

			callback(event)
		}
	}
	// Swallow any error thrown by responsePromise
	responsePromise.then(onPromiseResolveHandler).catch(() => {})
}

export const getResponseBody = async (
	response: Response,
	bodyKeysToRecord: string[] | undefined,
	bodyKeysToRedact: string[] | undefined,
) => {
	let text: string
	try {
		/**
		 * We are using the TextDecoder because it supports a larger number of use cases.
		 * Using just `response.text()` sometimes causes the body to fail due to the request being aborted.
		 * https://stackoverflow.com/questions/41946457/getting-text-from-fetch-response-object
		 */
		const clone = response.clone()
		const body = clone.body
		if (body) {
			let reader = body.getReader()
			let utf8Decoder = new TextDecoder()
			let nextChunk

			let result = ''

			while (!(nextChunk = await reader.read()).done) {
				let partialData = nextChunk.value
				result += utf8Decoder.decode(partialData)
			}
			text = result
			text = getBodyThatShouldBeRecorded(
				text,
				bodyKeysToRedact,
				bodyKeysToRecord,
				response.headers,
			)
		} else {
			text = ''
		}
	} catch (e) {
		text = `Unable to clone response: ${e as string}`
	}

	return text
}

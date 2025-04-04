import { getActiveSpan } from '../../../otel'
import {
	getNetworkSessionSecureID,
	getSessionSecureID,
} from '../../../utils/sessionStorage/highlightSession'
import { RequestResponsePair } from './models'
import { sanitizeResource } from './network-sanitizer'

export const HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'

export const normalizeUrl = (url: string) => {
	let urlToMutate = url
	/**
	 * Make sure URL includes the protocol and the host.
	 * For Next.js API routes, the URL is only the pathname.
	 * @example There's a Next.js API route called `/api/todo/create` on an app hosted at `https://todos.com`
	 * The URL we get from the XHR/Fetch listener is `/api/todo/create`.
	 * The Performance API's URL is `https://todos.com/api/todo/create`.
	 * Because of this mismatch, we fail to match the request with the headers/payload.
	 */
	if (!url.startsWith('https://') && !url.startsWith('http://')) {
		urlToMutate = `${window.location.origin}${urlToMutate}`
	}

	// Remove trailing forward slashes
	return urlToMutate.replace(/\/+$/, '')
}

type GroupedPerformanceTimings = {
	xmlhttprequest: { [url: string]: PerformanceResourceTiming[] }
	others: { [url: string]: PerformanceResourceTiming[] }
	fetch: { [url: string]: PerformanceResourceTiming[] }
}

type PerformanceResourceTimingWithRequestResponsePair =
	PerformanceResourceTiming & {
		requestResponsePair: RequestResponsePair
	}

type SanitizeOptions = {
	headersToRedact: string[]
	headersToRecord?: string[]
	requestResponseSanitizer?: (
		pair: RequestResponsePair,
	) => RequestResponsePair | null
}

const sanitizeRequestResponsePair = (
	pair: RequestResponsePair,
	{
		headersToRedact,
		headersToRecord,
		requestResponseSanitizer,
	}: SanitizeOptions,
): RequestResponsePair | null => {
	// body keys are already be redacted at this point (see getBodyThatShouldBeRecorded)
	let sanitizedPair: RequestResponsePair | null = pair

	// step 1: pass through user defined sanitizer
	if (requestResponseSanitizer) {
		let stringifyRequestBody = true
		try {
			sanitizedPair.request.body = JSON.parse(sanitizedPair.request.body)
		} catch (err) {
			stringifyRequestBody = false
		}

		let stringifyResponseBody = true
		try {
			sanitizedPair.response.body = JSON.parse(
				sanitizedPair.response.body,
			)
		} catch (err) {
			stringifyResponseBody = false
		}

		try {
			sanitizedPair = requestResponseSanitizer(sanitizedPair)
		} catch (err) {
		} finally {
			stringifyRequestBody =
				stringifyRequestBody && !!sanitizedPair?.request?.body
			stringifyResponseBody =
				stringifyResponseBody && !!sanitizedPair?.response?.body

			if (stringifyRequestBody) {
				sanitizedPair!.request.body = JSON.stringify(
					sanitizedPair!.request.body,
				)
			}
			if (stringifyResponseBody) {
				sanitizedPair!.response.body = JSON.stringify(
					sanitizedPair!.response.body,
				)
			}
		}

		if (!sanitizedPair) {
			return null
		}
	}

	// step 2: redact any specified headers
	const { request, response, ...rest } = sanitizedPair

	return {
		request: sanitizeResource(request, headersToRedact, headersToRecord),
		response: sanitizeResource(response, headersToRedact, headersToRecord),
		...rest,
	}
}

export const matchPerformanceTimingsWithRequestResponsePair = (
	performanceTimings: PerformanceResourceTiming[],
	requestResponsePairs: RequestResponsePair[],
	type: 'xmlhttprequest' | 'fetch',
	sanitizeOptions: SanitizeOptions,
) => {
	// Request response pairs are sorted by end time; sort performance timings the same way
	performanceTimings.sort((a, b) => a.responseEnd - b.responseEnd)

	const initialGroupedPerformanceTimings: GroupedPerformanceTimings = {
		xmlhttprequest: {},
		others: {},
		fetch: {},
	}

	const groupedPerformanceTimings: {
		[type: string]: { [url: string]: any[] }
	} = performanceTimings.reduce((previous, performanceTiming) => {
		const url = normalizeUrl(performanceTiming.name)
		if (performanceTiming.initiatorType === type) {
			previous[type][url] = [
				...(previous[type][url] || []),
				performanceTiming,
			]
		} else {
			previous.others[url] = [
				...(previous.others[url] || []),
				performanceTiming,
			]
		}
		return previous
	}, initialGroupedPerformanceTimings)

	let groupedRequestResponsePairs: {
		[url: string]: RequestResponsePair[]
	} = {}
	groupedRequestResponsePairs = requestResponsePairs.reduce(
		(previous, requestResponsePair) => {
			const url = normalizeUrl(requestResponsePair.request.url)
			previous[url] = [...(previous[url] || []), requestResponsePair]
			return previous
		},
		groupedRequestResponsePairs,
	)

	for (let url in groupedPerformanceTimings[type]) {
		const performanceTimingsForUrl = groupedPerformanceTimings[type][url]
		const requestResponsePairsForUrl = groupedRequestResponsePairs[url]
		if (!requestResponsePairsForUrl) {
			continue
		}
		/**
		 * We offset the starting because performanceTimings starts recording
		 * immediately and requestResponsePairs only start recording when Highlight
		 * is loaded. Because of this requestResponsePairs will not always have the
		 * first few requests made when a page loads.
		 */
		const offset = Math.max(
			performanceTimingsForUrl.length - requestResponsePairsForUrl.length,
			0,
		)
		for (let i = offset; i < performanceTimingsForUrl.length; i++) {
			if (performanceTimingsForUrl[i]) {
				performanceTimingsForUrl[i].requestResponsePair =
					requestResponsePairsForUrl[i - offset]
			}
		}
	}

	let result: PerformanceResourceTimingWithRequestResponsePair[] = []
	for (let type in groupedPerformanceTimings) {
		for (let url in groupedPerformanceTimings[type]) {
			result = result.concat(groupedPerformanceTimings[type][url])
		}
	}

	return result
		.sort((a, b) => a.fetchStart - b.fetchStart)
		.reduce(
			(
				resources: PerformanceResourceTimingWithRequestResponsePair[],
				performanceTiming: PerformanceResourceTimingWithRequestResponsePair,
			) => {
				let requestResponsePair: RequestResponsePair | null =
					performanceTiming.requestResponsePair

				if (requestResponsePair) {
					requestResponsePair = sanitizeRequestResponsePair(
						performanceTiming.requestResponsePair,
						sanitizeOptions,
					)

					// ignore request if it was filtered out by the user defined sanitizer
					if (!requestResponsePair) {
						return resources
					}
				}

				performanceTiming.toJSON = function () {
					// offset by `window.performance.timeOrigin` to get absolute timestamps
					const o = window.performance.timeOrigin
					return {
						initiatorType: this.initiatorType,
						startTimeAbs: o + this.startTime,
						connectStartAbs: o + this.connectStart,
						connectEndAbs: o + this.connectEnd,
						domainLookupStartAbs: o + this.domainLookupStart,
						domainLookupEndAbs: o + this.domainLookupEnd,
						fetchStartAbs: o + this.fetchStart,
						redirectStartAbs: o + this.redirectStart,
						redirectEndAbs: o + this.redirectEnd,
						requestStartAbs: o + this.requestStart,
						responseStartAbs: o + this.responseStart,
						responseEndAbs: o + this.responseEnd,
						secureConnectionStartAbs:
							o + this.secureConnectionStart,
						workerStartAbs: o + this.workerStart,
						name: this.name,
						transferSize: this.transferSize,
						encodedBodySize: this.encodedBodySize,
						decodedBodySize: this.decodedBodySize,
						nextHopProtocol: this.nextHopProtocol,
						requestResponsePairs: requestResponsePair,
					}
				}

				resources.push(performanceTiming)
				return resources
			},
			[],
		)
}

/**
 * Returns true if the name is a Highlight network resource.
 * This is used to filter out Highlight requests/responses from showing up on end application's network resources.
 */
const isHighlightNetworkResourceFilter = (
	name: string,
	highlightEndpoints: string[],
) =>
	highlightEndpoints.some((backendUrl) =>
		name.toLocaleLowerCase().includes(backendUrl),
	)

// Determines whether we store the network request and show it in the session
// replay, including the body and headers.
export const shouldNetworkRequestBeRecorded = (
	url: string,
	highlightEndpoints: string[],
	tracingOrigins?: boolean | (string | RegExp)[],
) => {
	return !isHighlightNetworkResourceFilter(url, highlightEndpoints)
}

// Determines whether we want to attach the x-highlight-request header to the
// request. We want to avoid adding this to external requests.
export const shouldNetworkRequestBeTraced = (
	url: string,
	tracingOrigins: boolean | (string | RegExp)[],
	urlBlocklist: string[],
) => {
	if (
		urlBlocklist.some((blockedUrl) =>
			url.toLowerCase().includes(blockedUrl),
		)
	) {
		return false
	}
	let patterns: (string | RegExp)[] = []
	if (tracingOrigins === true) {
		patterns = ['localhost', /^\//]
		if (window?.location?.host) {
			patterns.push(window.location.host)
		}
	} else if (tracingOrigins instanceof Array) {
		patterns = tracingOrigins
	}

	let result = false
	patterns.forEach((pattern) => {
		if (url.match(pattern)) {
			result = true
		}
	})
	return result
}

function makeId(length: number) {
	var result = ''
	var characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	var charactersLength = characters.length
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength),
		)
	}
	return result
}

export const createNetworkRequestId = () => {
	// Long enough to avoid collisions, not long enough to be unguessable
	const requestId = makeId(10)

	const context = getActiveSpan()
	const traceId = context?.spanContext().traceId
	return [getNetworkSessionSecureID(), traceId ?? requestId]
}

export const getHighlightRequestHeader = (
	sessionSecureID: string,
	requestId: string,
) => {
	return sessionSecureID + '/' + requestId
}

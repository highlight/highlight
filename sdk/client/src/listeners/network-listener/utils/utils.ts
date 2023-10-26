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
	let sanitizedPair: RequestResponsePair | null = pair

	// step 1: pass through user defined sanitizer
	if (requestResponseSanitizer) {
		try {
			sanitizedPair = requestResponseSanitizer(sanitizedPair)
		} catch (err) {}

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
					return {
						initiatorType: this.initiatorType,
						// deprecated, use the absolute versions instead
						startTime: this.startTime,
						responseEnd: this.responseEnd,
						// offset by `window.performance.timeOrigin` to get absolute timestamps
						startTimeAbs:
							window.performance.timeOrigin + this.startTime,
						responseEndAbs:
							window.performance.timeOrigin + this.responseEnd,
						name: this.name,
						transferSize: this.transferSize,
						encodedBodySize: this.encodedBodySize,
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
const isHighlightNetworkResourceFilter = (name: string, backendUrl: string) =>
	name
		.toLocaleLowerCase()
		.includes(
			import.meta.env.REACT_APP_PUBLIC_GRAPH_URI ?? 'highlight.run',
		) ||
	name.toLocaleLowerCase().includes('highlight.run') ||
	name.toLocaleLowerCase().includes(backendUrl)

export const shouldNetworkRequestBeRecorded = (
	url: string,
	highlightBackendUrl: string,
	tracingOrigins?: boolean | (string | RegExp)[],
) => {
	return (
		!isHighlightNetworkResourceFilter(url, highlightBackendUrl) ||
		shouldNetworkRequestBeTraced(url, tracingOrigins)
	)
}

export const shouldNetworkRequestBeTraced = (
	url: string,
	tracingOrigins?: boolean | (string | RegExp)[],
) => {
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
	return makeId(10)
}

export const getHighlightRequestHeader = (
	sessionSecureID: string,
	requestId: string,
) => {
	return sessionSecureID + '/' + requestId
}

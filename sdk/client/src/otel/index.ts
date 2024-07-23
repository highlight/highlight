import {
	CompositePropagator,
	W3CBaggagePropagator,
	W3CTraceContextPropagator,
} from '@opentelemetry/core'
import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	ReadableSpan,
	SimpleSpanProcessor,
	StackContextManager,
	WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { Resource } from '@opentelemetry/resources'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import {
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
	SEMRESATTRS_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions'
import * as api from '@opentelemetry/api'
import {
	BrowserXHR,
	getBodyThatShouldBeRecorded,
} from '../listeners/network-listener/utils/xhr-listener'
import type { NetworkRecordingOptions } from '../types/client'
import {
	DEFAULT_URL_BLOCKLIST,
	sanitizeHeaders,
} from '../listeners/network-listener/utils/network-sanitizer'
import {
	shouldNetworkRequestBeRecorded,
	shouldNetworkRequestBeTraced,
} from '../listeners/network-listener/utils/utils'
import { parse } from 'graphql'
import { getResponseBody } from '../listeners/network-listener/utils/fetch-listener'
import { UserInteractionInstrumentation } from './user-interaction'

export type BrowserTracingConfig = {
	projectId: string | number
	sessionSecureId: string
	backendUrl?: string
	endpoint?: string
	environment?: string
	networkRecordingOptions?: NetworkRecordingOptions
	serviceName?: string
	tracingOrigins?: boolean | (string | RegExp)[]
	urlBlocklist?: string[]
}

let provider: WebTracerProvider
const RECORD_ATTRIBUTE = 'highlight.record'

export const setupBrowserTracing = (config: BrowserTracingConfig) => {
	if (provider !== undefined) {
		console.warn('OTEL already initialized. Skipping...')
		return
	}

	const backendUrl =
		config.backendUrl ||
		import.meta.env.REACT_APP_PUBLIC_GRAPH_URI ||
		'https://pub.highlight.run'

	const urlBlocklist = [
		...(config.networkRecordingOptions?.urlBlocklist ?? []),
		...DEFAULT_URL_BLOCKLIST,
	]
	const isDebug = import.meta.env.DEBUG === 'true'
	const endpoint = config.endpoint ?? 'https://otel.highlight.io:4318'
	const environment = config.environment ?? 'production'

	provider = new WebTracerProvider({
		resource: new Resource({
			[SEMRESATTRS_SERVICE_NAME]:
				config.serviceName ?? 'highlight-browser',
			[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
			'highlight.project_id': config.projectId,
			'highlight.session_id': config.sessionSecureId,
		}),
	})

	// Export spans to console for debugging
	if (isDebug) {
		provider.addSpanProcessor(
			new SimpleSpanProcessor(new ConsoleSpanExporter()),
		)
	}

	const exporter = new OTLPTraceExporter({
		url: endpoint + '/v1/traces',
		concurrencyLimit: 10,
		// Using any because we were getting an error importing CompressionAlgorithm
		// from @opentelemetry/otlp-exporter-base.
		compression: 'gzip' as any,
	})

	const spanProcessor = new CustomBatchSpanProcessor(exporter, {
		maxExportBatchSize: 15,
	})
	provider.addSpanProcessor(spanProcessor)

	registerInstrumentations({
		instrumentations: [
			new DocumentLoadInstrumentation({
				applyCustomAttributesOnSpan: {
					documentLoad: assignDocumentDurations,
					documentFetch: assignDocumentDurations,
					resourceFetch: assignResourceFetchDurations,
				},
			}),
			new UserInteractionInstrumentation(),
			new FetchInstrumentation({
				propagateTraceHeaderCorsUrls: /.*/,
				applyCustomAttributesOnSpan: async (
					span,
					request,
					response,
				) => {
					const readableSpan = span as unknown as ReadableSpan
					if (readableSpan.attributes[RECORD_ATTRIBUTE] === false) {
						return
					}

					const url = readableSpan.attributes['http.url'] as string
					const method = request.method ?? 'GET'
					span.updateName(getSpanName(url, method, request.body))

					if (!(response instanceof Response)) {
						span.setAttributes({
							'http.response.error': response.message,
							'http.response.status': response.status,
						})
						return
					}

					enhanceSpanWithHttpRequestAttributes(
						span,
						request.body,
						request.headers,
						config.networkRecordingOptions,
					)

					const body = await getResponseBody(
						response,
						config.networkRecordingOptions?.bodyKeysToRecord,
						config.networkRecordingOptions?.networkBodyKeysToRedact,
					)
					span.setAttribute('http.response.body', body)
				},
			}),
			new XMLHttpRequestInstrumentation({
				propagateTraceHeaderCorsUrls: /.*/,
				applyCustomAttributesOnSpan: (span, xhr) => {
					const browserXhr = xhr as BrowserXHR
					const readableSpan = span as unknown as ReadableSpan
					if (readableSpan.attributes[RECORD_ATTRIBUTE] === false) {
						return
					}

					const spanName = getSpanName(
						browserXhr._url,
						browserXhr._method,
						xhr.responseText,
					)
					span.updateName(spanName)

					enhanceSpanWithHttpRequestAttributes(
						span,
						browserXhr._body,
						browserXhr._requestHeaders as Headers,
						config.networkRecordingOptions,
					)

					const recordedBody = getBodyThatShouldBeRecorded(
						browserXhr._body,
						config.networkRecordingOptions?.networkBodyKeysToRedact,
						config.networkRecordingOptions?.bodyKeysToRecord,
						browserXhr._requestHeaders as Headers,
					)
					span.setAttribute('http.request.body', recordedBody)
				},
			}),
		],
	})

	const contextManager = new StackContextManager()
	contextManager.enable()

	provider.register({
		contextManager,
		propagator: new CompositePropagator({
			propagators: [
				new W3CBaggagePropagator(),
				new CustomTraceContextPropagator({
					backendUrl,
					tracingOrigins: config.tracingOrigins,
					urlBlocklist,
				}),
			],
		}),
	})
}

class CustomBatchSpanProcessor extends BatchSpanProcessor {
	onEnd(span: ReadableSpan): void {
		if (span.attributes[RECORD_ATTRIBUTE] === false) {
			return // don't record spans that are marked as not to be recorded
		}

		super.onEnd(span)
	}
}

type CustomTraceContextPropagatorConfig = {
	backendUrl: string
	tracingOrigins: BrowserTracingConfig['tracingOrigins']
	urlBlocklist: string[]
}

class CustomTraceContextPropagator extends W3CTraceContextPropagator {
	private backendUrl: string
	private tracingOrigins: BrowserTracingConfig['tracingOrigins']
	private urlBlocklist: string[]

	constructor(config: CustomTraceContextPropagatorConfig) {
		super()

		this.backendUrl = config.backendUrl
		this.tracingOrigins = config.tracingOrigins
		this.urlBlocklist = config.urlBlocklist
	}

	inject(
		context: api.Context,
		carrier: unknown,
		setter: api.TextMapSetter,
	): void {
		const span = api.trace.getSpan(context)
		if (!span) {
			return
		}

		const url = (span as unknown as ReadableSpan).attributes['http.url']
		if (typeof url === 'string') {
			const shouldRecord = shouldRecordRequest(
				url,
				this.backendUrl,
				this.tracingOrigins,
				this.urlBlocklist,
			)

			if (!shouldRecord) {
				span.setAttribute(RECORD_ATTRIBUTE, false) // used later to avoid additional processing
				return // return early to prevent headers from being injected
			}
		}

		super.inject(context, carrier, setter)
	}
}

export const BROWSER_TRACER_NAME = 'highlight-browser'
export const getTracer = () => {
	return provider.getTracer(BROWSER_TRACER_NAME)
}

export const shutdown = async () => {
	if (provider === undefined) {
		return
	}

	await provider.forceFlush()
	provider.shutdown()
}

const getSpanName = (
	url: string,
	method: string,
	body: Request['body'] | BrowserXHR['_body'],
) => {
	let parsedBody
	const urlObject = new URL(url)
	const pathname = urlObject.pathname
	let spanName = `${method} - ${pathname}`

	try {
		parsedBody = typeof body === 'string' ? JSON.parse(body) : body

		if (parsedBody && parsedBody.query) {
			const query = parse(parsedBody.query)
			const queryName =
				query.definitions[0]?.kind === 'OperationDefinition'
					? query.definitions[0]?.name?.value
					: undefined

			if (queryName) {
				spanName = `${queryName} (GraphQL: ${
					urlObject.host + urlObject.pathname
				})`
			}
		}
	} catch {
		// Ignore errors from JSON parsing
	}

	return spanName
}

const enhanceSpanWithHttpRequestAttributes = (
	span: api.Span,
	body: Request['body'] | RequestInit['body'] | BrowserXHR['_body'],
	headers:
		| Headers
		| string
		| Request['headers']
		| RequestInit['headers']
		| ReturnType<XMLHttpRequest['getAllResponseHeaders']>,
	networkRecordingOptions?: NetworkRecordingOptions,
) => {
	const stringBody = typeof body === 'string' ? body : String(body)

	let parsedBody
	try {
		parsedBody = body ? JSON.parse(stringBody) : undefined

		if (parsedBody.operationName) {
			span.setAttribute(
				'graphql.operation.name',
				parsedBody.operationName,
			)
		}
	} catch {
		// Ignore
	}

	const sanitizedHeaders = sanitizeHeaders(
		networkRecordingOptions?.networkHeadersToRedact ?? [],
		headers as Headers,
		networkRecordingOptions?.headerKeysToRecord,
	)

	span.setAttributes({
		'highlight.type': 'http.request',
		'http.request.headers': JSON.stringify(sanitizedHeaders),
		'http.request.body': stringBody,
	})
}

const shouldRecordRequest = (
	url: string,
	backendUrl: string,
	tracingOrigins: BrowserTracingConfig['tracingOrigins'],
	urlBlocklist: string[],
) => {
	const shouldRecordHeaderAndBody = !urlBlocklist?.some((blockedUrl) =>
		url.toLowerCase().includes(blockedUrl),
	)
	if (!shouldRecordHeaderAndBody) {
		return false
	}

	// Potential future refactor: shouldNetworkRequestBeRecorded also calls
	// shouldNetworkRequestBeTraced, but it returns true for all non-Highlight
	// resources. Following existing patterns here, but we may want to decouple
	// these two functions and refactor some of the request filtering logic.
	const shouldRecord = shouldNetworkRequestBeRecorded(
		url,
		backendUrl,
		tracingOrigins,
	)
	if (!shouldRecord) {
		return false
	}

	return shouldNetworkRequestBeTraced(url, tracingOrigins)
}

const assignDocumentDurations = (span: api.Span) => {
	const readableSpan = span as unknown as ReadableSpan
	const events = readableSpan.events

	const durations = {
		unload: calculateDuration('unloadEventStart', 'unloadEventEnd', events),
		dom_interactive: calculateDuration(
			'domInteractive',
			'fetchStart',
			events,
		),
		dom_content_loaded: calculateDuration(
			'domContentLoadedEventEnd',
			'domContentLoadedEventStart',
			events,
		),
		dom_complete: calculateDuration('fetchStart', 'domComplete', events),
		load_event: calculateDuration('loadEventStart', 'loadEventEnd', events),
		first_paint: calculateDuration('fetchStart', 'firstPaint', events),
		first_contentful_paint: calculateDuration(
			'fetchStart',
			'firstContentfulPaint',
			events,
		),
		domain_lookup: calculateDuration(
			'domainLookupStart',
			'domainLookupEnd',
			events,
		),
		connect: calculateDuration('connectStart', 'connectEnd', events),
		request: calculateDuration('requestStart', 'requestEnd', events),
		response: calculateDuration('responseStart', 'responseEnd', events),
	}

	Object.entries(durations).forEach(([key, value]) => {
		if (value > 0) {
			span.setAttribute(`timings.${key}.ns`, value)
			span.setAttribute(
				`timings.${key}.readable`,
				humanizeDuration(value),
			)
		}
	})
}

type TimeEvent = {
	name: string
	time: [number, number] // seconds since epoch, nano seconds
}

function calculateDuration(
	startEventName: string,
	endEventName: string,
	events: TimeEvent[],
) {
	const startEvent = events.find((e) => e.name === startEventName)
	const endEvent = events.find((e) => e.name === endEventName)

	if (!startEvent || !endEvent) {
		return 0
	}

	const startNs = startEvent.time[0] * 1e9 + startEvent.time[1]
	const endNs = endEvent.time[0] * 1e9 + endEvent.time[1]
	return endNs - startNs
}

const assignResourceFetchDurations = (
	span: api.Span,
	resource: PerformanceResourceTiming,
) => {
	const durations = {
		domain_lookup:
			(resource.domainLookupEnd - resource.domainLookupStart) * 1e6,
		connect: (resource.connectEnd - resource.connectStart) * 1e6,
		request: (resource.responseEnd - resource.requestStart) * 1e6,
		response: (resource.responseEnd - resource.responseStart) * 1e6,
	}

	Object.entries(durations).forEach(([key, value]) => {
		if (value > 0) {
			span.setAttribute(`timings.${key}.ns`, value)
			span.setAttribute(
				`timings.${key}.readable`,
				humanizeDuration(value),
			)
		}
	})
}

// Transform a raw value to a human readable string with nanosecond precision.
// Use the highest unit that results in a value greater than 1.
const humanizeDuration = (nanoseconds: number): string => {
	const microsecond = 1000
	const millisecond = microsecond * 1000
	const second = millisecond * 1000
	const minute = second * 60
	const hour = minute * 60

	if (nanoseconds >= hour) {
		const hours = nanoseconds / hour
		return `${Number(hours.toFixed(1))}h`
	} else if (nanoseconds >= minute) {
		const minutes = nanoseconds / minute
		return `${Number(minutes.toFixed(1))}m`
	} else if (nanoseconds >= second) {
		const seconds = nanoseconds / second
		return `${Number(seconds.toFixed(1))}s`
	} else if (nanoseconds >= millisecond) {
		const milliseconds = nanoseconds / millisecond
		return `${Number(milliseconds.toFixed(1))}ms`
	} else if (nanoseconds >= microsecond) {
		const microseconds = nanoseconds / microsecond
		return `${Number(microseconds.toFixed(1))}µs`
	} else {
		return `${Number(nanoseconds.toFixed(1))}ns`
	}
}

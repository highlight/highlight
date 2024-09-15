import * as api from '@opentelemetry/api'
import {
	CompositePropagator,
	W3CBaggagePropagator,
	W3CTraceContextPropagator,
} from '@opentelemetry/core'
import {
	Instrumentation,
	registerInstrumentations,
} from '@opentelemetry/instrumentation'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { Resource } from '@opentelemetry/resources'
import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	PropagateTraceHeaderCorsUrls,
	ReadableSpan,
	SimpleSpanProcessor,
	StackContextManager,
	WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import * as SemanticAttributes from '@opentelemetry/semantic-conventions'
import { parse } from 'graphql'
import { getResponseBody } from '../listeners/network-listener/utils/fetch-listener'
import {
	DEFAULT_URL_BLOCKLIST,
	sanitizeHeaders,
} from '../listeners/network-listener/utils/network-sanitizer'
import {
	shouldNetworkRequestBeRecorded,
	shouldNetworkRequestBeTraced,
} from '../listeners/network-listener/utils/utils'
import {
	BrowserXHR,
	getBodyThatShouldBeRecorded,
} from '../listeners/network-listener/utils/xhr-listener'
import type {
	NetworkRecordingOptions,
	OtelInstrumentatonOptions,
} from '../types/client'
import {
	OTLPMetricExporterBrowser,
	OTLPTraceExporterBrowserWithXhrRetry,
	TraceExporterConfig,
} from './exporter'
import { UserInteractionInstrumentation } from './user-interaction'
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'

export type BrowserTracingConfig = {
	projectId: string | number
	sessionSecureId: string
	otlpEndpoint: string
	backendUrl?: string
	environment?: string
	networkRecordingOptions?: NetworkRecordingOptions
	serviceName?: string
	tracingOrigins?: boolean | (string | RegExp)[]
	urlBlocklist?: string[]
	instrumentations?: OtelInstrumentatonOptions
}

let providers: {
	tracerProvider?: WebTracerProvider
	meterProvider?: MeterProvider
} = {}
const RECORD_ATTRIBUTE = 'highlight.record'

export const setupBrowserTracing = (config: BrowserTracingConfig) => {
	if (providers.tracerProvider !== undefined) {
		console.warn('OTEL already initialized. Skipping...')
		return
	}

	const backendUrl =
		config.backendUrl ||
		import.meta.env.REACT_APP_PUBLIC_GRAPH_URI ||
		'https://pub.highlight.io'

	const urlBlocklist = [
		...(config.networkRecordingOptions?.urlBlocklist ?? []),
		...DEFAULT_URL_BLOCKLIST,
	]
	const isDebug = import.meta.env.DEBUG === 'true'
	const environment = config.environment ?? 'production'

	const exporterOptions: TraceExporterConfig = {
		url: config.otlpEndpoint + '/v1/traces',
		concurrencyLimit: 100,
		timeoutMillis: 5_000,
		// Using any because we were getting an error importing CompressionAlgorithm
		// from @opentelemetry/otlp-exporter-base.
		compression: 'gzip' as any,
		keepAlive: true,
		httpAgentOptions: {
			timeout: 5_000,
			keepAlive: true,
		},
	}
	const exporter = new OTLPTraceExporterBrowserWithXhrRetry(exporterOptions)

	const spanProcessor = new CustomBatchSpanProcessor(exporter, {
		maxExportBatchSize: 100,
		maxQueueSize: 1_000,
		exportTimeoutMillis: exporterOptions.timeoutMillis,
		scheduledDelayMillis: exporterOptions.timeoutMillis,
	})

	const resource = new Resource({
		[SemanticAttributes.ATTR_SERVICE_NAME]:
			config.serviceName ?? 'highlight-browser',
		[SemanticAttributes.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
		'highlight.project_id': config.projectId,
		'highlight.session_id': config.sessionSecureId,
	})
	providers.tracerProvider = new WebTracerProvider({
		resource,
		spanProcessors: isDebug
			? [
					new SimpleSpanProcessor(new ConsoleSpanExporter()),
					spanProcessor,
				]
			: [spanProcessor],
	})
	api.trace.setGlobalTracerProvider(providers.tracerProvider)

	const meterExporter = new OTLPMetricExporterBrowser({
		...exporterOptions,
		url: config.otlpEndpoint + '/v1/metrics',
	})
	const reader = new PeriodicExportingMetricReader({
		exporter: meterExporter,
		exportIntervalMillis: exporterOptions.timeoutMillis,
		exportTimeoutMillis: exporterOptions.timeoutMillis,
	})

	providers.meterProvider = new MeterProvider({ resource, readers: [reader] })
	api.metrics.setGlobalMeterProvider(providers.meterProvider)

	// TODO: allow passing in custom instrumentations/configurations
	let instrumentations: Instrumentation[] = []

	const documentLoadConfig =
		config.instrumentations?.[
			'@opentelemetry/instrumentation-document-load'
		]
	if (documentLoadConfig !== false) {
		instrumentations.push(
			new DocumentLoadInstrumentation({
				applyCustomAttributesOnSpan: {
					documentLoad: assignDocumentDurations,
					documentFetch: assignDocumentDurations,
					resourceFetch: assignResourceFetchDurations,
				},
			}),
		)
	}

	const userInteractionConfig =
		config.instrumentations?.[
			'@opentelemetry/instrumentation-user-interaction'
		]
	if (userInteractionConfig !== false) {
		instrumentations.push(new UserInteractionInstrumentation())
	}

	if (config.networkRecordingOptions?.enabled) {
		const fetchInstrumentationConfig =
			config.instrumentations?.['@opentelemetry/instrumentation-fetch']
		if (fetchInstrumentationConfig !== false) {
			instrumentations.push(
				new FetchInstrumentation({
					propagateTraceHeaderCorsUrls: getCorsUrlsPattern(
						config.tracingOrigins,
					),
					applyCustomAttributesOnSpan: async (
						span,
						request,
						response,
					) => {
						if (!(span as any).attributes) {
							return
						}
						const readableSpan = span as unknown as ReadableSpan
						if (
							readableSpan.attributes[RECORD_ATTRIBUTE] === false
						) {
							return
						}

						const url = readableSpan.attributes[
							'http.url'
						] as string
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
							config.networkRecordingOptions
								?.networkBodyKeysToRedact,
						)
						span.setAttribute('http.response.body', body)
					},
				}),
			)
		}

		const xmlInstrumentationConfig =
			config.instrumentations?.[
				'@opentelemetry/instrumentation-xml-http-request'
			]
		if (xmlInstrumentationConfig !== false) {
			instrumentations.push(
				new XMLHttpRequestInstrumentation({
					propagateTraceHeaderCorsUrls: getCorsUrlsPattern(
						config.tracingOrigins,
					),
					applyCustomAttributesOnSpan: (span, xhr) => {
						const browserXhr = xhr as BrowserXHR
						if (!(span as any).attributes) {
							return
						}
						const readableSpan = span as unknown as ReadableSpan
						if (
							readableSpan.attributes[RECORD_ATTRIBUTE] === false
						) {
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
							config.networkRecordingOptions
								?.networkBodyKeysToRedact,
							config.networkRecordingOptions?.bodyKeysToRecord,
							browserXhr._requestHeaders as Headers,
						)
						span.setAttribute('http.request.body', recordedBody)
					},
				}),
			)
		}
	}

	registerInstrumentations({ instrumentations })

	const contextManager = new StackContextManager()
	contextManager.enable()

	providers.tracerProvider.register({
		contextManager,
		propagator: new CompositePropagator({
			propagators: [
				new W3CBaggagePropagator(),
				new CustomTraceContextPropagator({
					backendUrl,
					otlpEndpoint: config.otlpEndpoint,
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
	otlpEndpoint: string
	tracingOrigins: BrowserTracingConfig['tracingOrigins']
	urlBlocklist: string[]
}

class CustomTraceContextPropagator extends W3CTraceContextPropagator {
	private highlightEndpoints: string[]
	private tracingOrigins: BrowserTracingConfig['tracingOrigins']
	private urlBlocklist: string[]

	constructor(config: CustomTraceContextPropagatorConfig) {
		super()

		this.highlightEndpoints = [
			config.backendUrl,
			`${config.otlpEndpoint}/v1/traces`,
			`${config.otlpEndpoint}/v1/logs`,
			`${config.otlpEndpoint}/v1/metrics`,
		]
		this.tracingOrigins = config.tracingOrigins
		this.urlBlocklist = config.urlBlocklist
	}

	inject(
		context: api.Context,
		carrier: unknown,
		setter: api.TextMapSetter,
	): void {
		const span = api.trace.getSpan(context)
		if (!span || !(span as any).attributes) {
			return
		}

		const url = (span as unknown as ReadableSpan).attributes['http.url']
		if (typeof url === 'string') {
			const shouldRecord = shouldRecordRequest(
				url,
				this.highlightEndpoints,
				this.tracingOrigins,
				this.urlBlocklist,
			)

			if (!shouldRecord) {
				span.setAttribute(RECORD_ATTRIBUTE, false) // used later to avoid additional processing
			}

			const shouldTrace = shouldNetworkRequestBeTraced(
				url,
				this.tracingOrigins ?? [],
				this.urlBlocklist,
			)
			if (!shouldTrace) {
				return // return early to prevent headers from being injected
			}
		}

		super.inject(context, carrier, setter)
	}
}

export const BROWSER_TRACER_NAME = 'highlight-browser'
export const BROWSER_METER_NAME = BROWSER_TRACER_NAME
export const getTracer = () => {
	return providers.tracerProvider?.getTracer(BROWSER_TRACER_NAME)
}
export const getMeter = () => {
	return providers.meterProvider?.getMeter(BROWSER_METER_NAME)
}

export const getActiveSpan = () => {
	return api.trace.getActiveSpan()
}

export const getActiveSpanContext = () => {
	return api.context.active()
}

export const shutdown = async () => {
	if (providers.tracerProvider) {
		await providers.tracerProvider.forceFlush()
		await providers.tracerProvider.shutdown()
	} else {
		console.warn('OTEL shutdown called without initialized tracerProvider.')
	}
	if (providers.meterProvider) {
		await providers.meterProvider.forceFlush()
		await providers.meterProvider.shutdown()
	} else {
		console.warn('OTEL shutdown called without initialized meterProvider.')
	}
}

const getSpanName = (
	url: string,
	method: string,
	body: Request['body'] | BrowserXHR['_body'],
) => {
	let parsedBody
	const urlObject = new URL(url)
	const pathname = urlObject.pathname
	let spanName = `${method.toUpperCase()} - ${pathname}`

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
		| RequestInit['headers']
		| ReturnType<XMLHttpRequest['getAllResponseHeaders']>,
	networkRecordingOptions?: NetworkRecordingOptions,
) => {
	const stringBody = typeof body === 'string' ? body : String(body)
	if (!(span as any).attributes) {
		return
	}
	const readableSpan = span as unknown as ReadableSpan
	const url = readableSpan.attributes['http.url'] as string
	const urlObject = new URL(url)

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
		[SemanticAttributes.ATTR_URL_FULL]: url,
		[SemanticAttributes.ATTR_URL_PATH]: urlObject.pathname,
		[SemanticAttributes.ATTR_URL_QUERY]: urlObject.search,
	})

	if (urlObject.searchParams.size > 0) {
		span.setAttributes({
			// Custom attribute that displays query string params as an object.
			['url.query_params']: JSON.stringify(
				Object.fromEntries(urlObject.searchParams),
			),
		})
	}
}

const shouldRecordRequest = (
	url: string,
	highlightEndpoints: string[],
	tracingOrigins: BrowserTracingConfig['tracingOrigins'],
	urlBlocklist: string[],
) => {
	const shouldRecordHeaderAndBody = !urlBlocklist?.some((blockedUrl) =>
		url.toLowerCase().includes(blockedUrl),
	)
	if (!shouldRecordHeaderAndBody) {
		return false
	}

	return shouldNetworkRequestBeRecorded(
		url,
		highlightEndpoints,
		tracingOrigins,
	)
}

const assignDocumentDurations = (span: api.Span) => {
	if (!(span as any).events) {
		return
	}
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

export const getCorsUrlsPattern = (
	tracingOrigins: BrowserTracingConfig['tracingOrigins'],
): PropagateTraceHeaderCorsUrls => {
	if (tracingOrigins === true) {
		return [/localhost/, /^\//, new RegExp(window.location.host)]
	} else if (Array.isArray(tracingOrigins)) {
		return tracingOrigins.map((pattern) =>
			typeof pattern === 'string' ? new RegExp(pattern) : pattern,
		)
	}

	return /^$/ // Match nothing if tracingOrigins is false or undefined
}

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
import { BatchSpanProcessorBase } from '@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase'
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
			new DocumentLoadInstrumentation(),
			new UserInteractionInstrumentation(),
			new FetchInstrumentation({
				propagateTraceHeaderCorsUrls: /.*/,
				applyCustomAttributesOnSpan: async (
					span,
					request,
					response,
				) => {
					const url = (span as any).attributes['http.url']
					const method = request.method ?? 'GET'
					const shouldRecord = shouldRecordRequest(
						url,
						backendUrl,
						config.tracingOrigins,
						urlBlocklist,
					)

					if (!shouldRecord) {
						span.setAttribute('highlight.record', false)
						removeTraceHeaders(request)
						return
					}

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
				applyCustomAttributesOnSpan: (
					span: api.Span,
					xhr: XMLHttpRequest,
				) => {
					const browserXhr = xhr as BrowserXHR
					const shouldRecord = shouldRecordRequest(
						browserXhr._url,
						backendUrl,
						config.tracingOrigins,
						urlBlocklist,
					)

					if (!shouldRecord) {
						span.setAttribute('highlight.record', false)
						browserXhr.setRequestHeader('traceparent', '')
						browserXhr.setRequestHeader('tracestate', '')
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
				new W3CTraceContextPropagator(),
			],
		}),
	})
}

class CustomBatchSpanProcessor extends BatchSpanProcessor {
	onEnd(span: ReadableSpan): void {
		if (span.attributes['highlight.record'] === false) {
			return // don't record spans that are marked as not to be recorded
		}

		super.onEnd(span)
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
	const pathname = new URL(url).pathname
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
				spanName = `${queryName} (GraphQL: ${pathname})`
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

	// TODO: Check on this logic. shouldNetworkRequestBeRecorded also calls
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

const removeTraceHeaders = (request: Request | RequestInit) => {
	if (request.headers instanceof Headers) {
		request.headers.delete('traceparent')
		request.headers.delete('tracestate')
	} else if (Array.isArray(request.headers)) {
		let i = 0
		while (i < request.headers.length) {
			if (
				request.headers[i][0] === 'traceparent' ||
				request.headers[i][0] === 'tracestate'
			) {
				request.headers.splice(i, 1)
			} else {
				i++
			}
		}
	} else if (typeof request.headers === 'object') {
		delete request.headers['traceparent']
		delete request.headers['tracestate']
	}
}

import {
	CompositePropagator,
	W3CBaggagePropagator,
	W3CTraceContextPropagator,
} from '@opentelemetry/core'
import {
	BatchSpanProcessor,
	BufferConfig,
	ConsoleSpanExporter,
	ReadableSpan,
	SimpleSpanProcessor,
	SpanExporter,
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
import { UserInteractionInstrumentation } from './user-interaction'
import { parse } from 'graphql'
import {
	getFetchRequestProperties,
	getResponseBody,
} from '../listeners/network-listener/utils/fetch-listener'

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
		...(config.urlBlocklist ?? []),
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

	provider.register({
		propagator: new CompositePropagator({
			propagators: [
				new W3CBaggagePropagator(),
				new W3CTraceContextPropagator(),
			],
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
		concurrencyLimit: 3,
		// Using any because we were getting an error importing CompressionAlgorithm
		// from @opentelemetry/otlp-exporter-base.
		compression: 'gzip' as any,
	})

	const spanProcessor = new CustomSpanProcessor(exporter, {
		backendUrl,
		urlBlocklist,
		tracingOrigins: config.tracingOrigins,
	})
	provider.addSpanProcessor(spanProcessor)

	// Can customize by passing a config object as 2nd param.
	provider.addSpanProcessor(new BatchSpanProcessor(exporter))

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
					const { method, url } = getFetchRequestProperties(
						request as Request,
						request,
					)

					span.updateName(getSpanName(url, method, request.body))
					debugger

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

					const body = await getResponseBody(response)
					enhanceSpanWithHttpResponseAttributes(
						span,
						body,
						response.headers,
						config.networkRecordingOptions,
					)
				},
			}),
			new XMLHttpRequestInstrumentation({
				propagateTraceHeaderCorsUrls: /.*/,
				applyCustomAttributesOnSpan: (
					span: api.Span,
					xhr: XMLHttpRequest,
				) => {
					const browserXhr = xhr as BrowserXHR
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
					enhanceSpanWithHttpResponseAttributes(
						span,
						browserXhr._body,
						xhr.getAllResponseHeaders(),
						config.networkRecordingOptions,
					)
				},
			}),
		],
	})

	provider.register()
}

type CustomSpanProcessorConfig = BufferConfig & {
	backendUrl?: string
	urlBlocklist?: string[]
	tracingOrigins?: boolean | (string | RegExp)[]
}

class CustomSpanProcessor extends BatchSpanProcessorBase<CustomSpanProcessorConfig> {
	private backendUrl: string
	private urlBlocklist: string[]
	private tracingOrigins: boolean | (string | RegExp)[]

	constructor(exporter: SpanExporter, config: CustomSpanProcessorConfig) {
		super(exporter)

		this.backendUrl = config.backendUrl ?? ''
		this.urlBlocklist = config.urlBlocklist ?? DEFAULT_URL_BLOCKLIST
		this.tracingOrigins = config.tracingOrigins ?? false
	}

	onStart(): void {
		// Do nothing. Types required us to implement this method.
	}

	onEnd(span: ReadableSpan): void {
		const url = span.attributes['http.url']

		if (typeof url === 'string') {
			const shouldRecordHeaderAndBody = !this.urlBlocklist.some(
				(blockedUrl) => url.toLowerCase().includes(blockedUrl),
			)

			const shouldRecord = shouldNetworkRequestBeRecorded(
				url,
				this.backendUrl,
				this.tracingOrigins,
			)

			const shouldRecordNetworkRequest = shouldNetworkRequestBeTraced(
				url,
				this.tracingOrigins,
			)

			if (
				!shouldRecordHeaderAndBody ||
				!shouldRecord ||
				!shouldRecordNetworkRequest
			) {
				span.spanContext().traceFlags = 0 // prevents span from being recorded
			}
		}
	}

	onShutdown(): void {
		// Do nothing. Types required us to implement this method.
	}
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
	let parsedBody

	try {
		parsedBody = body ? JSON.parse(String(body)) : undefined
	} catch {
		// Ignore
	}

	if (parsedBody) {
		try {
			setObjectAttributes(span, parsedBody, 'http.request.body')

			if (parsedBody.operationName) {
				span.setAttributes({
					'graphql.operation.name': parsedBody.operationName,
				})
			}
		} catch {
			// Ignore
		}
	}

	const sanitizedHeaders = sanitizeHeaders(
		networkRecordingOptions?.networkHeadersToRedact ?? [''],
		headers as Headers,
		networkRecordingOptions?.headerKeysToRecord,
	)

	span.setAttribute('highlight.type', 'http.request')
	span.setAttribute('http.request.headers', JSON.stringify(sanitizedHeaders))
}

const enhanceSpanWithHttpResponseAttributes = (
	span: api.Span,
	body: Request['body'] | Response['body'] | XMLHttpRequest['responseText'],
	headers: Headers | string,
	networkRecordingOptions?: NetworkRecordingOptions,
) => {
	let parsedBody
	span.setAttribute('highlight.response', 'true')

	try {
		parsedBody = typeof body === 'string' ? JSON.parse(body) : body
	} catch {
		// Ignore
	}

	const recordedBody = getBodyThatShouldBeRecorded(
		parsedBody,
		networkRecordingOptions?.networkBodyKeysToRedact,
		networkRecordingOptions?.bodyKeysToRecord,
		headers as Headers,
	)

	// TODO: We don't seem to be able to access this sometimes. Figure out why.
	span.setAttributes({
		'http.response.body': recordedBody,
	})
}

function setObjectAttributes(span: api.Span, body: any, prefix: string) {
	for (const key in body) {
		if (typeof body[key] === 'object' && body[key] !== null) {
			setObjectAttributes(span, body[key], `${prefix}.${key}`)
		} else {
			span.setAttribute(`${prefix}.${key}`, JSON.stringify(body[key]))
		}
	}
}

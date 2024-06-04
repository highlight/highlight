import {
	BatchSpanProcessor,
	BufferConfig,
	ReadableSpan,
	SpanExporter,
	WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { Resource } from '@opentelemetry/resources'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import {
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
	SEMRESATTRS_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions'
import { BatchSpanProcessorBase } from '@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase'
import { Context, Span } from '@opentelemetry/api'
import {
	BrowserXHR,
	getBodyThatShouldBeRecorded,
} from './listeners/network-listener/utils/xhr-listener'
import type { NetworkRecordingOptions } from './types/client'
import { sanitizeHeaders } from './listeners/network-listener/utils/network-sanitizer'
import { shouldNetworkRequestBeTraced } from './listeners/network-listener/utils/utils'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'

export type OtelConfig = {
	projectId: string | number
	sessionSecureId: string
	endpoint?: string
	environment?: string
	networkRecordingOptions?: NetworkRecordingOptions
	serviceName?: string
	tracingOrigins?: boolean | (string | RegExp)[]
}

let provider: WebTracerProvider

export const initializeOtel = (config: OtelConfig) => {
	if (provider !== undefined) {
		console.warn('OTEL already initialized. Skipping...')
		return
	}

	// TODO: Is there a better way to determine if we're in dev mode? Seems
	// import.meta.env.DEV is set to dev when building with dev:frontend.
	const isDev = window.location.hostname === 'localhost'
	const fallbackEndpoint = isDev
		? 'https://localhost:4318'
		: 'https://otel.highlight.io:4318'

	const endpoint = config.endpoint ?? fallbackEndpoint
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
	// if (isDev) {
	// 	provider.addSpanProcessor(
	// 		new SimpleSpanProcessor(new ConsoleSpanExporter()),
	// 	)
	// }

	const exporter = new OTLPTraceExporter({
		url: endpoint + '/v1/traces',
		concurrencyLimit: 3,
		// Using any because we were getting an error importing CompressionAlgorithm
		// from @opentelemetry/otlp-exporter-base.
		compression: 'gzip' as any,
	})

	const spanProcessor = new CustomSpanProcessor(exporter, {
		tracingOrigins: config.tracingOrigins,
	})
	provider.addSpanProcessor(spanProcessor)

	// Can customize by passing a config object as 2nd param.
	provider.addSpanProcessor(new BatchSpanProcessor(exporter))

	registerInstrumentations({
		instrumentations: [
			new DocumentLoadInstrumentation(),
			// See if we can capture element details, like innerHTML
			new UserInteractionInstrumentation(),
			// Try to capture GraphQL data in requests
			new FetchInstrumentation({
				applyCustomAttributesOnSpan: (span, request, response) => {
					if (!(response instanceof Response)) {
						span.setAttributes({
							'http.response.error': response.message,
							'http.response.status': response.status,
						})
						return
					}

					span.updateName(
						getSpanName(
							response.url,
							request.method ?? 'GET',
							response.body,
						),
					)

					enhanceSpanWithHttpRequestAttributes(
						span,
						request.body,
						request.headers,
						config.networkRecordingOptions,
					)
					enhanceSpanWithHttpResponseAttributes(
						span,
						response.body,
						response.headers,
						config.networkRecordingOptions,
					)
				},
			}),
			new XMLHttpRequestInstrumentation({
				applyCustomAttributesOnSpan: (
					span: Span,
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
						xhr.response,
						browserXhr._requestHeaders as Headers,
						config.networkRecordingOptions,
					)
					enhanceSpanWithHttpResponseAttributes(
						span,
						xhr.response,
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
	tracingOrigins?: boolean | (string | RegExp)[]
}

class CustomSpanProcessor extends BatchSpanProcessorBase<CustomSpanProcessorConfig> {
	private tracingOrigins: boolean | (string | RegExp)[]

	constructor(exporter: SpanExporter, config: CustomSpanProcessorConfig) {
		super(exporter)

		this.tracingOrigins = config.tracingOrigins ?? false
	}

	onStart(): void {
		// Do nothing. Types required us to implement this method.
	}

	onEnd(span: ReadableSpan): void {
		if (typeof span.attributes['http.url'] === 'string') {
			const shouldRecordNetworkRequest = shouldNetworkRequestBeTraced(
				span.attributes['http.url'],
				this.tracingOrigins,
			)

			if (!shouldRecordNetworkRequest) {
				span.spanContext().traceFlags = 0 // prevents span from being recorded
			}
		}
	}

	onShutdown(): void {
		// Do nothing. Types required us to implement this method.
	}
}

export const getOtelProvider = (): WebTracerProvider => {
	if (provider === undefined) {
		throw new Error('OTEL provider not initialized')
	}

	return provider
}

const getSpanName = (
	url: string,
	method: string,
	body: Request['body'] | Response['body'] | XMLHttpRequest['responseText'],
) => {
	let parsedBody
	let spanName = `${method} - ${new URL(url).pathname}`

	try {
		parsedBody = typeof body === 'string' ? JSON.parse(body) : body
		if (parsedBody && parsedBody.operationName) {
			spanName = parsedBody.operationName
		}
	} catch {
		// Ignore
	}

	return spanName
}

const enhanceSpanWithHttpRequestAttributes = (
	span: Span,
	body:
		| Request['body']
		| XMLHttpRequest['responseText']
		| RequestInit['body'],
	headers:
		| Headers
		| string
		| Request['headers']
		| RequestInit['headers']
		| ReturnType<XMLHttpRequest['getAllResponseHeaders']>,
	networkRecordingOptions?: NetworkRecordingOptions,
) => {
	let parsedBody
	let parsedHeaders

	try {
		parsedBody = body ? JSON.parse(String(body)) : undefined
		parsedHeaders =
			typeof headers === 'string' ? headers : new Headers(headers)
	} catch {
		// Ignore
	}

	if (parsedBody) {
		try {
			setObjectAttributes(span, parsedBody, 'http.request.body')
		} catch {
			// Ignore
		}
	}

	const sanitizedHeaders = sanitizeHeaders(
		networkRecordingOptions?.networkHeadersToRedact ?? [''],
		parsedHeaders as Headers,
		networkRecordingOptions?.headerKeysToRecord,
	)

	span.setAttribute('http.request.headers', JSON.stringify(sanitizedHeaders))
}

const enhanceSpanWithHttpResponseAttributes = (
	span: Span,
	body: Request['body'] | Response['body'] | XMLHttpRequest['responseText'],
	headers: Headers | string,
	networkRecordingOptions?: NetworkRecordingOptions,
) => {
	let parsedBody
	let parsedHeaders

	try {
		parsedBody = typeof body === 'string' ? JSON.parse(body) : body
		parsedHeaders =
			typeof headers === 'string' ? headers : new Headers(headers)
	} catch {
		// Ignore
	}

	const recordedBody = getBodyThatShouldBeRecorded(
		parsedBody,
		networkRecordingOptions?.networkBodyKeysToRedact,
		networkRecordingOptions?.bodyKeysToRecord,
		parsedHeaders as Headers,
	)

	span.setAttributes({
		'http.response.body': recordedBody,
	})
}

function setObjectAttributes(span: Span, body: any, prefix: string) {
	for (const key in body) {
		if (typeof body[key] === 'object' && body[key] !== null) {
			// If the property is an object, recursively set attributes
			setObjectAttributes(span, body[key], `${prefix}.${key}`)
		} else {
			// If the property is not an object, set the attribute
			span.setAttribute(`${prefix}.${key}`, JSON.stringify(body[key]))
		}
	}
}

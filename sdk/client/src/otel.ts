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
import { getBodyThatShouldBeRecorded } from './listeners/network-listener/utils/xhr-listener'
import type { NetworkRecordingOptions } from './types/client'
import { sanitizeHeaders } from './listeners/network-listener/utils/network-sanitizer'
import { shouldNetworkRequestBeTraced } from './listeners/network-listener/utils/utils'

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
		// TODO: Was getting an error importing CompressionAlgorithm from
		// @opentelemetry/otlp-exporter-base, so leaving out for now.
		// compression: CompressionAlgorithm.GZIP,
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
					const url = new URL((response as Response).url)
					let spanName =
						(request.method ? `${request.method} - ` : '') +
						url.pathname

					try {
						const body = JSON.parse(String(request.body))
						if (body.operationName) {
							spanName = body.operationName
						}
					} catch {
						// Ignore
					}

					span.updateName(spanName)

					enhanceSpanWithHttpRequestAttributes(
						span,
						request,
						config.networkRecordingOptions,
					)
					enhanceSpanWithHttpResponseAttributes(
						span,
						response as Response,
						config.networkRecordingOptions,
					)
				},
			}),
			// TODO: Add similar instrumentation for XHR requests
			new XMLHttpRequestInstrumentation({
				applyCustomAttributesOnSpan: (
					span: Span,
					xhr: XMLHttpRequest,
				) => {
					const url = new URL(xhr.responseURL)
					// TODO: See if we have types for our overrides
					const method = (xhr as any)._method
					let spanName = (method ? `${method} - ` : '') + url.pathname

					// try {
					// 	const body = JSON.parse(xhr.body)
					// 	if (body.operationName) {
					// 		spanName = body.operationName
					// 	}
					// } catch {
					// 	// Ignore
					// }

					span.updateName(spanName)

					// enhanceSpanWithHttpRequestAttributes(
					// 	span,
					// 	xhr,
					// 	config.networkRecordingOptions,
					// )
					// enhanceSpanWithHttpResponseAttributes(
					// 	span,
					// 	response as Response,
					// 	config.networkRecordingOptions,
					// )
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

	onStart(_span: Span, _parentContext: Context): void {
		// Do nothing. Types required us to implement this method.
	}

	onEnd(span: ReadableSpan): void {
		const isRequestSpan = span.attributes['http.method'] !== undefined

		if (isRequestSpan) {
			const url = span.attributes['http.url']?.toString() ?? ''
			const shouldRecordNetworkRequest = shouldNetworkRequestBeTraced(
				url,
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

const enhanceSpanWithHttpRequestAttributes = (
	span: Span,
	request: Request | RequestInit,
	networkRecordingOptions?: NetworkRecordingOptions,
) => {
	if (request.body) {
		try {
			setObjectAttributes(
				span,
				JSON.parse(String(request.body)),
				'http.request.body',
			)
		} catch {
			// Ignore
		}
	}

	const headers = sanitizeHeaders(
		networkRecordingOptions?.networkHeadersToRedact ?? [''],
		request.headers,
		networkRecordingOptions?.headerKeysToRecord,
	)

	span.setAttribute('http.request.headers', JSON.stringify(headers))
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

const enhanceSpanWithHttpResponseAttributes = (
	span: Span,
	response: Response,
	networkRecordingOptions?: NetworkRecordingOptions,
) => {
	if (response === undefined) {
		return
	}

	const body = getBodyThatShouldBeRecorded(
		response.body,
		networkRecordingOptions?.networkBodyKeysToRedact,
		networkRecordingOptions?.bodyKeysToRecord,
		response.headers,
	)

	span.setAttributes({
		'http.response.body': body,
	})
}

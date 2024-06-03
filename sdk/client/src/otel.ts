import {
	BatchSpanProcessor,
	BufferConfig,
	ConsoleSpanExporter,
	SimpleSpanProcessor,
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

export type OtelConfig = {
	projectId: string | number
	sessionSecureId: string
	endpoint?: string
	environment?: string
	ignoreUrls?: Array<string | RegExp>
	serviceName?: string
}

let provider: WebTracerProvider
let spanProcessor: CustomSpanProcessor

export const initializeOtel = (config: OtelConfig) => {
	if (provider !== undefined) {
		console.warn('OTEL already initialized. Skipping...')
		return
	}

	// TODO: Is there a better way to determine if we're in dev mode? Seems
	// import.meta.env.DEV is set to dev when building with dev:frontend.
	console.log('::: import.meta.env', import.meta.env)
	const isDev = window.location.hostname === 'localhost'
	const fallbackEndpoint = isDev
		? 'https://localhost:4318' // TODO: make configurable
		: 'https://otel.highlight.io'

	const endpoint = config.endpoint ?? fallbackEndpoint
	const environment = config.environment ?? 'production'

	provider = new WebTracerProvider({
		resource: new Resource({
			[SEMRESATTRS_SERVICE_NAME]:
				config.serviceName ?? 'highlight-browser',
			[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
		}),
	})

	// Export spans to console for debugging
	if (isDev) {
		provider.addSpanProcessor(
			new SimpleSpanProcessor(new ConsoleSpanExporter()),
		)
	}

	const exporter = new OTLPTraceExporter({
		url: endpoint + '/v1/traces',
		concurrencyLimit: 3,
		// TODO: Was getting an error importing CompressionAlgorithm from
		// @opentelemetry/otlp-exporter-base, so leaving out for now.
		// compression: CompressionAlgorithm.GZIP,
	})

	spanProcessor = new CustomSpanProcessor(exporter, {
		projectId: config.projectId,
		sessionSecureId: config.sessionSecureId,
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
				ignoreUrls: config.ignoreUrls,
			}),
			new XMLHttpRequestInstrumentation({
				ignoreUrls: config.ignoreUrls,
			}),
		],
	})

	provider.register()
}

type CustomSpanProcessorConfig = BufferConfig & {
	projectId: string | number
	sessionSecureId: string
}

class CustomSpanProcessor extends BatchSpanProcessorBase<CustomSpanProcessorConfig> {
	private projectId: string | number
	private sessionSecureId: string

	constructor(exporter: SpanExporter, config: CustomSpanProcessorConfig) {
		super(exporter)

		this.projectId = config.projectId
		this.sessionSecureId = config.sessionSecureId
	}

	onStart(span: Span, _parentContext: Context): void {
		console.log('::: onStart', span)

		span.setAttributes({
			'highlight.project_id': this.projectId,
			'highlight.session_id': this.sessionSecureId,
		})
	}

	onShutdown(): void {
		// TODO: Figure out if we need to do anything here. Types required us to
		// implement the method.
		console.log('::: shutdown')
	}
}

export const getOtelProvider = (): WebTracerProvider => {
	if (provider === undefined) {
		throw new Error('OTEL provider not initialized')
	}

	return provider
}

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import {
	BatchSpanProcessor,
	StackContextManager,
	WebTracerProvider,
	Tracer,
} from '@opentelemetry/sdk-trace-web'
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import {
	LoggerProvider,
	BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import { Resource, ResourceAttributes } from '@opentelemetry/resources'
import * as SemanticAttributes from '@opentelemetry/semantic-conventions'
import * as api from '@opentelemetry/api'
import * as apiLogs from '@opentelemetry/api-logs'
import { CompositePropagator, W3CBaggagePropagator } from '@opentelemetry/core'
import { Gauge } from '@opentelemetry/api'

const HIGHLIGHT_PROJECT_ENV = 'HIGHLIGHT_PROJECT_ID'
const HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'
const HIGHLIGHT_OTLP_BASE = 'https://otel.highlight.io:4318'

export const RECORDED_CONSOLE_METHODS = [
	'debug',
	'error',
	'info',
	'log',
	'warn',
] as const

export interface HighlightEnv {
	[HIGHLIGHT_PROJECT_ENV]: string
	HIGHLIGHT_OTLP_ENDPOINT?: string
}

type Metric = {
	secureSessionId: string
	name: string
	value: number
	requestId: string
	tags?: { name: string; value: string }[]
}

type WorkersSDK = {
	tracer: Tracer
	logger: apiLogs.Logger
	meter: api.Meter
}

export interface HighlightInterface {
	init: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
		service?: string,
	) => WorkersSDK
	isInitialized: () => boolean
	consumeError: (error: Error) => void
	sendResponse: (response: Response) => void
	setAttributes: (attributes: ResourceAttributes) => void
	recordMetric: (metric: Metric) => void
}

let sdk: WorkersSDK
let projectID: string

let _gauges: Map<string, Gauge> = new Map<string, Gauge>()

export const H: HighlightInterface = {
	// Initialize the highlight SDK. This monkeypatches the console methods to start sending console logs to highlight.
	init: (
		request: Request,
		{
			[HIGHLIGHT_PROJECT_ENV]: _projectID,
			HIGHLIGHT_OTLP_ENDPOINT: otlpEndpoint,
		}: HighlightEnv,
		ctx: ExecutionContext,
		service?: string,
	) => {
		const { secureSessionId, requestId } = extractRequestMetadata(request)

		projectID = _projectID

		const endpoints = { default: otlpEndpoint || HIGHLIGHT_OTLP_BASE }
		const exporterOptions = {
			url: endpoints.default + '/v1/traces',
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
		const processorOptions = {
			maxExportBatchSize: 100,
			maxQueueSize: 1_000,
			exportTimeoutMillis: exporterOptions.timeoutMillis,
			scheduledDelayMillis: exporterOptions.timeoutMillis,
		}
		const exporter = new OTLPTraceExporter(exporterOptions)

		const spanProcessor = new BatchSpanProcessor(exporter, processorOptions)

		const resource = new Resource({
			[SemanticAttributes.ATTR_SERVICE_NAME]:
				service ?? 'highlight-cloudflare',
			'highlight.project_id': projectID,
		})
		const tracerProvider = new WebTracerProvider({
			resource,
			spanProcessors: [spanProcessor],
		})
		api.trace.setGlobalTracerProvider(tracerProvider)

		const loggerProvider = new LoggerProvider({
			resource,
		})
		loggerProvider.addLogRecordProcessor(
			new BatchLogRecordProcessor(
				new OTLPLogExporter({
					...exporterOptions,
					url: endpoints.default + '/v1/logs',
				}),
				processorOptions,
			),
		)

		apiLogs.logs.setGlobalLoggerProvider(loggerProvider)

		const meterExporter = new OTLPMetricExporter({
			...exporterOptions,
			url: endpoints.default + '/v1/metrics',
		})
		const reader = new PeriodicExportingMetricReader({
			exporter: meterExporter,
			exportIntervalMillis: exporterOptions.timeoutMillis,
			exportTimeoutMillis: exporterOptions.timeoutMillis,
		})

		const meterProvider = new MeterProvider({
			resource,
			readers: [reader],
		})
		api.metrics.setGlobalMeterProvider(meterProvider)

		const contextManager = new StackContextManager()
		contextManager.enable()

		tracerProvider.register({
			contextManager,
			propagator: new CompositePropagator({
				propagators: [new W3CBaggagePropagator()],
			}),
		})

		sdk = {
			tracer: tracerProvider.getTracer('tracer'),
			logger: loggerProvider.getLogger('logger', undefined, {
				includeTraceContext: true,
			}),
			meter: meterProvider.getMeter('meter'),
		}

		for (const m of RECORDED_CONSOLE_METHODS) {
			const originalConsoleMethod = console[m]

			console[m] = (message: string, ...args: unknown[]) => {
				const lg = loggerProvider.getLogger('console', undefined, {
					includeTraceContext: true,
				})
				lg.emit({
					body: message,
					attributes: args
						.filter((d) => typeof d === 'object')
						.filter((d) => !!d)
						.reduce((a, b) => ({ ...a, ...b }), {}) as {
						[attributeKey: string]: string
					},
					severityText: m,
				})
				originalConsoleMethod.apply(originalConsoleMethod, [
					message,
					...args,
				])
			}
		}
		return sdk
	},

	isInitialized: () => !!sdk,

	// Capture a javascript exception as an error in highlight.
	consumeError: (error: Error) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.sendResponse(...)',
			)
			return
		}

		const span = sdk.tracer.startSpan('error')
		span.recordException(error)
		span.end()
	},

	// Capture a cloudflare response as a trace in highlight.
	sendResponse: (response: Response) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.sendResponse(...)',
			)
			return
		}

		const span = sdk.tracer.startSpan('response', {
			attributes: {
				[SemanticAttributes.ATTR_HTTP_RESPONSE_STATUS_CODE]:
					response.status,
			},
		})

		for (const headerKey of response.headers.keys()) {
			if (headerKey === 'set-cookie') {
				continue
			}
			span.setAttribute(
				`http.response.header.${headerKey.toLowerCase()}`,
				[response.headers.get(headerKey)],
			)
		}

		span.end()
	},

	// Set custom attributes on the errors and logs reported to highlight.
	// Setting a key previously set will update the value.
	setAttributes: (attributes: ResourceAttributes) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.setAttributes(...)',
			)
			return
		}

		// @ts-ignore
		sdk.traceProvider.resource = sdk.traceProvider.resource.merge(
			new Resource(attributes),
		)
	},

	recordMetric: ({ secureSessionId, name, value, requestId, tags }) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.recordMetric(...)',
			)
			return
		}

		let gauge = _gauges.get(name)
		if (!gauge) {
			gauge = sdk.meter.createGauge(name)
			_gauges.set(name, gauge)
		}
		gauge.record(value, {
			...tags?.reduce((a, b) => ({ ...a, [b.name]: b.value }), {}),
			'highlight.session_id': secureSessionId,
			'highlight.trace_id': requestId,
		})
	},
}

export function extractRequestMetadata(request: Request) {
	const [secureSessionId, requestId] = (
		request.headers.get(HIGHLIGHT_REQUEST_HEADER) || ''
	).split('/')

	return { secureSessionId, requestId }
}

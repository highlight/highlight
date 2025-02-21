import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import {
	BatchSpanProcessor,
	Tracer,
	WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import { Resource, ResourceAttributes } from '@opentelemetry/resources'
import { type Meter, type Gauge, trace, metrics } from '@opentelemetry/api'
import {
	ATTR_HTTP_RESPONSE_STATUS_CODE,
	ATTR_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions'

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
	meter: Meter
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
			[ATTR_SERVICE_NAME]: service ?? 'highlight-cloudflare',
			'highlight.project_id': projectID,
		})
		const tracerProvider = new WebTracerProvider({
			resource,
			spanProcessors: [spanProcessor],
		})
		trace.setGlobalTracerProvider(tracerProvider)

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
		metrics.setGlobalMeterProvider(meterProvider)

		sdk = {
			tracer: tracerProvider.getTracer('tracer'),
			meter: meterProvider.getMeter('meter'),
		}

		for (const m of RECORDED_CONSOLE_METHODS) {
			const originalConsoleMethod = console[m]

			console[m] = (message: string, ...args: unknown[]) => {
				const o: { stack: any } = { stack: {} }
				Error.captureStackTrace(o)

				const span = sdk.tracer.startSpan('highlight.log')
				// log specific events from https://github.com/highlight/highlight/blob/19ea44c616c432ef977c73c888c6dfa7d6bc82f3/sdk/highlight-go/otel.go#L34-L36
				span.addEvent('log', {
					...(args
						.filter((d) => typeof d === 'object')
						.filter((d) => !!d)
						.reduce((a, b) => ({ ...a, ...b }), {}) as {
						[attributeKey: string]: string
					}),
					// pass stack so that error creation on our end can show a structured stacktrace for errors
					['exception.stacktrace']: JSON.stringify(o.stack),
					['highlight.project_id']: projectID,
					['log.severity']: m,
					['log.message']: message,
					...(secureSessionId
						? {
								['highlight.session_id']: secureSessionId,
							}
						: {}),
					...(requestId
						? {
								['highlight.trace_id']: requestId,
							}
						: {}),
				})
				span.end()

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
				[ATTR_HTTP_RESPONSE_STATUS_CODE]: response.status,
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

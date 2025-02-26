/* Required to patch missing performance API in Cloudflare Workers. */
import './navigator'

import {
	AlwaysOnSampler,
	BatchSpanProcessor,
	Tracer,
	WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import { Resource, ResourceAttributes } from '@opentelemetry/resources'
import {
	context,
	type Gauge,
	type Meter,
	metrics,
	propagation,
	SpanOptions,
	Span as OtelSpan,
	trace,
} from '@opentelemetry/api'
import {
	CompositePropagator,
	TRACE_PARENT_HEADER,
	W3CBaggagePropagator,
	W3CTraceContextPropagator,
} from '@opentelemetry/core'
import {
	ATTR_HTTP_RESPONSE_STATUS_CODE,
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import * as packageJson from '../package.json'
import { OTLPTraceExporterFetch, OTLPMetricExporterFetch } from './exporter'

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
	tracerProvider: WebTracerProvider
	tracer: Tracer
	meterProvider: MeterProvider
	meter: Meter
}

export interface HighlightInterface {
	init: (env: HighlightEnv, service?: string) => WorkersSDK
	isInitialized: () => boolean
	consumeError: (error: Error) => void
	flush: () => Promise<void>
	setAttributes: (attributes: ResourceAttributes) => void
	recordMetric: (metric: Metric) => void
	runWithHeaders: <T>(
		name: string,
		headers: Headers,
		cb: (span: OtelSpan) => Promise<T>,
		options?: SpanOptions,
	) => Promise<T>
}

let sdk: WorkersSDK
let projectID: string

let _gauges: Map<string, Gauge> = new Map<string, Gauge>()

export const H: HighlightInterface = {
	// Initialize the highlight SDK. This monkeypatches the console methods to start sending console logs to highlight.
	init: (
		{
			[HIGHLIGHT_PROJECT_ENV]: _projectID,
			HIGHLIGHT_OTLP_ENDPOINT: otlpEndpoint,
		}: HighlightEnv,
		service?: string,
		serviceVersion?: string,
	) => {
		projectID = _projectID

		propagation.setGlobalPropagator(
			new CompositePropagator({
				propagators: [
					new W3CBaggagePropagator(),
					new W3CTraceContextPropagator(),
				],
			}),
		)

		const endpoints = { default: otlpEndpoint || HIGHLIGHT_OTLP_BASE }
		const exporterOptions = {
			url: endpoints.default + '/v1/traces',
			concurrencyLimit: 100,
			timeoutMillis: 5_000,
		}
		const processorOptions = {
			maxExportBatchSize: 100,
			maxQueueSize: 1_000,
			exportTimeoutMillis: exporterOptions.timeoutMillis,
			scheduledDelayMillis: exporterOptions.timeoutMillis,
		}
		const exporter = new OTLPTraceExporterFetch(exporterOptions)
		const spanProcessor = new BatchSpanProcessor(exporter, processorOptions)

		const resource = new Resource({
			[ATTR_SERVICE_NAME]: service ?? 'highlight-cloudflare',
			[ATTR_SERVICE_VERSION]: serviceVersion ?? '',
			'highlight.project_id': projectID,
			'telemetry.distro.name': '@highlight-run/cloudflare',
			'telemetry.distro.version': packageJson.version,
		})
		const tracerProvider = new WebTracerProvider({
			resource,
			spanProcessors: [spanProcessor],
			sampler: new AlwaysOnSampler(),
			mergeResourceWithDefaults: true,
		})
		trace.setGlobalTracerProvider(tracerProvider)

		const meterExporter = new OTLPMetricExporterFetch({
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
			tracerProvider,
			tracer: tracerProvider.getTracer(
				'@highlight-run/cloudflare',
				packageJson.version,
			),
			meterProvider,
			meter: meterProvider.getMeter(
				'@highlight-run/cloudflare',
				packageJson.version,
			),
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
				'please call H.init(...) before calling H.consumeError(...)',
			)
			return
		}

		let span = trace.getActiveSpan()
		if (span) {
			span.recordException(error)
			return
		}

		span = sdk.tracer.startSpan('error')
		span.recordException(error)
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
		// noinspection JSConstantReassignment
		sdk.tracer.resource = sdk.tracer.resource.merge(
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

	flush: async () => {
		if (!sdk) {
			console.error('please call H.init(...) before calling H.flush(...)')
			return
		}
		try {
			await sdk.tracerProvider.forceFlush()
		} catch (e) {
			// throws if nothing to flush
		}
		try {
			await sdk.meterProvider.forceFlush()
		} catch (e) {
			// throws if nothing to flush
		}
	},

	async runWithHeaders<T>(
		name: string,
		headers: Headers,
		cb: (span: OtelSpan) => Promise<T>,
		options?: SpanOptions,
	) {
		const requestHeaders = extractIncomingHttpHeaders(headers)
		const ctx = propagation.extract(context.active(), requestHeaders)

		let secureSessionId = ''
		if (requestHeaders[HIGHLIGHT_REQUEST_HEADER]) {
			;[secureSessionId] =
				`${requestHeaders[HIGHLIGHT_REQUEST_HEADER]}`.split('/')
		}

		return await sdk.tracer.startActiveSpan(
			name,
			options ?? {},
			ctx,
			async (span) => {
				if (secureSessionId) {
					span.setAttribute('highlight.session_id', secureSessionId)
				}
				propagation.inject(context.active(), headers)
				try {
					const response = await cb(span)
					if (response instanceof Response) {
						span.setAttribute(
							ATTR_HTTP_RESPONSE_STATUS_CODE,
							response.status,
						)
						Object.entries(response.headers).forEach(([k, v]) => {
							if (k === 'set-cookie') {
								return
							}
							span.setAttribute(
								`http.response.header.${k.toLowerCase()}`,
								v,
							)
						})
					}
					return response
				} catch (error) {
					span.recordException(error as Error)
					throw error
				} finally {
					span.end()
				}
			},
		)
	},
}

function extractIncomingHttpHeaders(headers?: Headers): Record<string, string> {
	if (headers !== undefined && headers !== null) {
		let requestHeaders: Record<string, string> = {}
		headers.forEach((value: string | string[] | undefined, key: string) => {
			if (typeof value === 'string') {
				requestHeaders[key] = value
			}
		})
		return requestHeaders
	} else {
		return {}
	}
}

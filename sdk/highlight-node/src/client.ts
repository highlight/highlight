import api, {
	Attributes,
	BaggageEntry,
	Context,
	Counter,
	diag,
	DiagConsoleLogger,
	DiagLogLevel,
	Gauge,
	Histogram,
	Meter,
	metrics,
	propagation,
	Span as OtelSpan,
	SpanOptions,
	trace,
	Tracer,
	UpDownCounter,
} from '@opentelemetry/api'
import { Logger } from '@opentelemetry/api-logs'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import {
	CompositePropagator,
	W3CBaggagePropagator,
	W3CTraceContextPropagator,
} from '@opentelemetry/core'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import { processDetectorSync, Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
	AlwaysOnSampler,
	BatchSpanProcessor,
	BufferConfig,
} from '@opentelemetry/sdk-trace-base'
import {
	BatchLogRecordProcessor,
	LoggerProvider,
} from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { hookConsole } from './hooks.js'
import log from './log.js'
import {
	type Headers,
	HIGHLIGHT_REQUEST_HEADER,
	type IncomingHttpHeaders,
} from './sdk.js'
import type { HighlightContext, Metric, NodeOptions } from './types.js'
import * as packageJson from '../package.json'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions'
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base/build/src/configuration/legacy-node-configuration'

const OTLP_HTTP = 'https://otel.highlight.io:4318'

const instrumentations = getNodeAutoInstrumentations({
	'@opentelemetry/instrumentation-http': {
		enabled:
			(process.env.OTEL_NODE_ENABLED_INSTRUMENTATIONS || '')
				.split(',')
				.indexOf('http') !== -1,
	},
	'@opentelemetry/instrumentation-fs': {
		enabled:
			(process.env.OTEL_NODE_ENABLED_INSTRUMENTATIONS || '')
				.split(',')
				.indexOf('fs') !== -1,
	},
	'@opentelemetry/instrumentation-pino': {
		logHook: (span, record, _) => {
			// @ts-ignore
			const attrs = span.attributes
			for (const [key, value] of Object.entries(attrs)) {
				record[key] = value
			}
		},
	},
})
instrumentations.push(new PrismaInstrumentation())
registerInstrumentations({ instrumentations })

const OTEL_TO_OPTIONS = {
	[ATTR_SERVICE_NAME]: 'serviceName',
	[ATTR_SERVICE_VERSION]: 'serviceVersion',
	[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: 'environment',
} as const

export class Highlight {
	readonly FLUSH_TIMEOUT_MS = 5 * 1000
	_projectID: string
	_debug: boolean
	otel: NodeSDK

	private readonly tracer: Tracer
	private readonly logger: Logger
	private readonly meter: Meter

	private readonly processor: BatchSpanProcessor
	private readonly loggerProvider: LoggerProvider
	private readonly metricsReader: PeriodicExportingMetricReader

	private readonly _gauges: Map<string, Gauge> = new Map<string, Gauge>()
	private readonly _counters: Map<string, Counter> = new Map<
		string,
		Counter
	>()
	private readonly _histograms: Map<string, Histogram> = new Map<
		string,
		Histogram
	>()
	private readonly _up_down_counters: Map<string, UpDownCounter> = new Map<
		string,
		UpDownCounter
	>()

	constructor(options: NodeOptions) {
		this._debug = !!options.debug
		this._projectID = options.projectID
		if (!this._projectID) {
			console.warn(
				'Highlight project id was not provided. Data will not be recorded.',
			)
		}

		if (this._debug) {
			diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
			options.disableConsoleRecording = true
			this._log('debug mode is enabled; console recording turned off')
		}

		if (!options.disableConsoleRecording) {
			hookConsole(options, (c) => {
				this.log(
					c.date,
					c.message,
					c.level,
					c.stack,
					'',
					'',
					c.attributes,
				)
			})
		}

		const config = {
			url: options.otlpEndpoint ?? OTLP_HTTP,
			keepAlive: true,
			compression:
				!process.env.NEXT_RUNTIME ||
				process.env.NEXT_RUNTIME === 'nodejs'
					? CompressionAlgorithm.GZIP
					: undefined,
			timeoutMillis: this.FLUSH_TIMEOUT_MS,
		} as OTLPExporterNodeConfigBase
		this._log('using otlp exporter settings', config)
		const opts = {
			maxExportBatchSize: 1024 * 1024,
			maxQueueSize: 1024 * 1024,
			scheduledDelayMillis: this.FLUSH_TIMEOUT_MS,
			exportTimeoutMillis: this.FLUSH_TIMEOUT_MS,
		} as BufferConfig

		const attributes: Attributes = options.attributes || {}
		attributes['highlight.project_id'] = this._projectID
		attributes['telemetry.distro.name'] = '@highlight-run/node'
		attributes['telemetry.distro.version'] = packageJson.version

		for (const [otelAttr, option] of Object.entries(OTEL_TO_OPTIONS)) {
			if (options[option]) {
				attributes[otelAttr] = options[option]
			}
		}
		const resource = new Resource(attributes)

		const exporter = new OTLPTraceExporter({
			...config,
			url: `${config.url}/v1/traces`,
		})
		this.processor = new BatchSpanProcessor(exporter, opts)

		this.loggerProvider = new LoggerProvider({
			resource,
		})
		const logsExporter = new OTLPLogExporter({
			...config,
			url: `${config.url}/v1/logs`,
		})
		const logsProcessor = new BatchLogRecordProcessor(logsExporter, opts)
		this.loggerProvider.addLogRecordProcessor(logsProcessor)

		const metricsExporter = new OTLPMetricExporter({
			...config,
			url: `${config.url}/v1/metrics`,
		})
		this.metricsReader = new PeriodicExportingMetricReader({
			exporter: metricsExporter,
			exportIntervalMillis: opts.scheduledDelayMillis,
			exportTimeoutMillis: opts.scheduledDelayMillis,
		})

		this.otel = new NodeSDK({
			autoDetectResources: true,
			resourceDetectors: [processDetectorSync],
			resource,
			spanProcessors: [this.processor],
			logRecordProcessors: [logsProcessor],
			metricReader: this.metricsReader,
			traceExporter: exporter,
			contextManager: new AsyncLocalStorageContextManager(),
			sampler: new AlwaysOnSampler(),
			instrumentations,
			textMapPropagator: new CompositePropagator({
				propagators: [
					new W3CBaggagePropagator(),
					new W3CTraceContextPropagator(),
				],
			}),
		})
		this.otel.start()

		this.tracer = trace.getTracer(
			'@highlight-run/node',
			packageJson.version,
		)
		this.logger = this.loggerProvider.getLogger(
			'@highlight-run/node',
			packageJson.version,
			{
				includeTraceContext: true,
			},
		)
		this.meter = metrics.getMeter(
			'@highlight-run/node',
			packageJson.version,
		)

		for (const event of [
			'beforeExit',
			'exit',
			'SIGABRT',
			'SIGTERM',
			'SIGINT',
		]) {
			process.on(event, async () => {
				await this.flush()
				process.exit()
			})
		}

		this._log(`Initialized SDK for project ${this._projectID}`)
	}

	async stop() {
		await this.flush()
		await this.otel.shutdown()
	}

	_log(...data: any[]) {
		if (this._debug) {
			log('client', ...data)
		}
	}

	recordMetric(metric: Metric) {
		if (!this.meter) return

		let gauge = this._gauges.get(metric.name)
		if (!gauge) {
			gauge = this.meter.createGauge(metric.name)
			this._gauges.set(metric.name, gauge)
		}

		gauge.record(
			metric.value,
			metric.tags?.reduce((a, b) => ({ ...a, [b.name]: b.value }), {}),
		)
	}

	recordCount(metric: Metric) {
		if (!this.meter) return

		let counter = this._counters.get(metric.name)
		if (!counter) {
			counter = this.meter.createCounter(metric.name)
			this._counters.set(metric.name, counter)
		}

		counter.add(
			metric.value,
			metric.tags?.reduce((a, b) => ({ ...a, [b.name]: b.value }), {}),
		)
	}

	recordIncr(metric: Omit<Metric, 'value'>) {
		this.recordCount({ ...metric, value: 1 })
	}

	recordHistogram(metric: Metric) {
		if (!this.meter) return

		let histogram = this._histograms.get(metric.name)
		if (!histogram) {
			histogram = this.meter.createHistogram(metric.name)
			this._histograms.set(metric.name, histogram)
		}

		histogram.record(
			metric.value,
			metric.tags?.reduce((a, b) => ({ ...a, [b.name]: b.value }), {}),
		)
	}

	recordUpDownCounter(metric: Metric) {
		if (!this.meter) return

		let up_down_counter = this._up_down_counters.get(metric.name)
		if (!up_down_counter) {
			up_down_counter = this.meter.createUpDownCounter(metric.name)
			this._up_down_counters.set(metric.name, up_down_counter)
		}

		up_down_counter.add(
			metric.value,
			metric.tags?.reduce((a, b) => ({ ...a, [b.name]: b.value }), {}),
		)
	}

	log(
		date: Date,
		msg: string,
		level: string,
		stack: object,
		secureSessionId?: string,
		requestId?: string,
		metadata?: Attributes,
	) {
		if (!this.logger) return

		if (!secureSessionId && !requestId) {
			const entry = propagation
				.getActiveBaggage()
				?.getEntry(HIGHLIGHT_REQUEST_HEADER)
			if (entry?.value) {
				;[secureSessionId, requestId] = entry?.value.split('/')
			}
		}

		this.logger.emit({
			timestamp: date,
			severityText: level,
			body: msg,
			attributes: {
				...(metadata ?? {}),
				// pass stack so that error creation on our end can show a structured stacktrace for errors
				['exception.stacktrace']: JSON.stringify(stack),
				...(secureSessionId
					? {
							['highlight.session_id']: secureSessionId,
						}
					: {}),
			},
		})
	}

	consumeCustomError(
		error: Error,
		secureSessionId: string | undefined,
		requestId: string | undefined,
		metadata?: Attributes,
		options?: { span: OtelSpan },
	) {
		let span = options?.span ?? api.trace.getActiveSpan()
		if (!span) {
			span = this.tracer.startSpan('highlight.error')
		}
		span.recordException(error)
		if (metadata != undefined) {
			span.setAttributes(metadata)
		}
		if (secureSessionId) {
			span.setAttribute('highlight.session_id', secureSessionId)
		}
		if (error.cause && typeof error.cause === 'object') {
			span.setAttributes(
				Object.entries(error.cause)
					.map(([k, v]) => [`exception.cause.${k}`, v])
					.reduce((acc, [k, v]) => {
						acc[k] = JSON.stringify(v)
						return acc
					}, {} as Attributes),
			)
		} else if (error.cause) {
			span.setAttribute('exception.cause', error.cause.toString())
		}
		this._log('created error span', span)
		span.end()
	}

	async flush() {
		try {
			await this.processor.forceFlush()
			await this.loggerProvider.forceFlush()
			await this.metricsReader.forceFlush()
		} catch (e) {
			this._log('failed to flush: ', e)
		}
	}

	setAttributes(attributes: Attributes) {
		trace.getActiveSpan()?.setAttributes(attributes)
	}

	parseHeaders(headers: Headers | IncomingHttpHeaders): HighlightContext {
		return parseHeaders(headers)
	}

	async runWithHeaders<T>(
		name: string,
		headers: Headers | IncomingHttpHeaders,
		cb: (span: OtelSpan) => T | Promise<T>,
		options?: SpanOptions,
	) {
		const { span, ctx } = this.startWithHeaders(name, headers, options)
		return await api.context.with(ctx, async () => {
			propagation.inject(ctx, headers)
			try {
				return await cb(span)
			} catch (error) {
				span.recordException(error as Error)
				throw error
			} finally {
				span.end()
			}
		})
	}

	startWithHeaders<T>(
		spanName: string,
		headers: Headers | IncomingHttpHeaders,
		options?: SpanOptions,
	): { span: OtelSpan; ctx: Context } {
		const ctx = propagation.extract(api.context.active(), headers)
		const span = this.tracer.startSpan(spanName, options, ctx)
		const contextWithSpanSet = api.trace.setSpan(ctx, span)

		let { secureSessionId, requestId } = this.parseHeaders(headers)
		if (!secureSessionId && !requestId) {
			const entry = propagation
				.getActiveBaggage()
				?.getEntry(HIGHLIGHT_REQUEST_HEADER)
			if (entry?.value) {
				;[secureSessionId, requestId] = entry?.value.split('/')
			}
		}
		if (secureSessionId) {
			span.setAttributes({
				'highlight.session_id': secureSessionId,
			})

			propagation.getActiveBaggage()?.setEntry(HIGHLIGHT_REQUEST_HEADER, {
				value: `${secureSessionId}/${requestId}`,
			} as BaggageEntry)
		}

		propagation.inject(contextWithSpanSet, headers)
		return { span, ctx: contextWithSpanSet }
	}
}

function parseHeaders(
	headers: Headers | IncomingHttpHeaders,
): HighlightContext {
	const requestHeaders = extractIncomingHttpHeaders(headers)

	if (requestHeaders[HIGHLIGHT_REQUEST_HEADER]) {
		const [secureSessionId, requestId] =
			`${requestHeaders[HIGHLIGHT_REQUEST_HEADER]}`.split('/')
		return { secureSessionId, requestId }
	}
	return { secureSessionId: undefined, requestId: undefined }
}

function extractIncomingHttpHeaders(headers?: any): IncomingHttpHeaders {
	if (headers !== undefined && headers !== null) {
		let requestHeaders: IncomingHttpHeaders = {}
		if (typeof headers.get === 'function') {
			requestHeaders[HIGHLIGHT_REQUEST_HEADER] = headers.get(
				HIGHLIGHT_REQUEST_HEADER,
			)
		} else if (typeof headers.forEach === 'function') {
			headers.forEach(
				(value: string | string[] | undefined, key: string) =>
					(requestHeaders[key] = value),
			)
		} else if (headers[HIGHLIGHT_REQUEST_HEADER]) {
			requestHeaders[HIGHLIGHT_REQUEST_HEADER] = (
				headers as { [HIGHLIGHT_REQUEST_HEADER]: string }
			)[HIGHLIGHT_REQUEST_HEADER]
		} else {
			requestHeaders = headers
		}

		return requestHeaders
	} else {
		return {}
	}
}

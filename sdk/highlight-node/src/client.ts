import {
	AlwaysOnSampler,
	BufferConfig,
	ReadableSpan,
	Span,
} from '@opentelemetry/sdk-trace-base'
import { BatchSpanProcessorBase } from '@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase'
import api, {
	Attributes,
	BaggageEntry,
	Context,
	diag,
	DiagConsoleLogger,
	DiagLogLevel,
	propagation,
	Span as OtelSpan,
	SpanOptions,
	trace,
	Tracer,
} from '@opentelemetry/api'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import {
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
	SEMRESATTRS_SERVICE_NAME,
	SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { processDetectorSync, Resource } from '@opentelemetry/resources'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { W3CBaggagePropagator } from '@opentelemetry/core'
import type { IncomingHttpHeaders } from 'http'
import { clearInterval } from 'timers'
import type { HighlightContext, NodeOptions } from './types.js'
import { hookConsole } from './hooks.js'
import log from './log.js'
import { HIGHLIGHT_REQUEST_HEADER } from './sdk.js'

const OTLP_HTTP = 'https://otel.highlight.io:4318'
const FIVE_MINUTES = 1000 * 60 * 5

type TraceMapValue = {
	attributes: { 'highlight.session_id': string; 'highlight.trace_id': string }

	destroy: () => void
}

const instrumentations = getNodeAutoInstrumentations({
	'@opentelemetry/instrumentation-http': {
		enabled: false,
	},
	'@opentelemetry/instrumentation-pino': {
		logHook: (span, record, level) => {
			// @ts-ignore
			const attrs = span.attributes
			for (const [key, value] of Object.entries(attrs)) {
				record[key] = value
			}
		},
	},
})

/**
 * Baggage propagation does not appear to be patching Fetch at the moment,
 * but we hope it'll get fixed soon:
 * https://github.com/open-telemetry/opentelemetry-js-contrib/pull/1951
 *
 * Docs: https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-core/README.md
 */
propagation.setGlobalPropagator(new W3CBaggagePropagator())

registerInstrumentations({ instrumentations })

// @ts-ignore
class CustomSpanProcessor extends BatchSpanProcessorBase<BufferConfig> {
	private _listeners: Map<Symbol, () => void> = new Map()
	private traceAttributesMap = new Map<string, TraceMapValue>()
	private finishedSpanNames = new Set<string>()

	getTraceMetadata(span: ReadableSpan) {
		return this.traceAttributesMap.get(span.spanContext().traceId)
	}

	setTraceMetadata(span: OtelSpan, attributes: TraceMapValue['attributes']) {
		const { traceId } = span.spanContext()

		if (!this.traceAttributesMap.get(traceId)) {
			const timer = setTimeout(() => destroy(), FIVE_MINUTES)
			const destroy = () => {
				this.traceAttributesMap.delete(traceId)

				clearTimeout(timer)
			}

			return this.traceAttributesMap.set(traceId, { attributes, destroy })
		}
	}

	getFinishedSpanNames() {
		return this.finishedSpanNames
	}

	clearFinishedSpanNames() {
		return this.finishedSpanNames.clear()
	}

	onEnd(span: ReadableSpan) {
		const traceMetadata = this.getTraceMetadata(span)

		if (traceMetadata) {
			// @ts-ignore
			span.resource = span.resource.merge(
				new Resource(traceMetadata.attributes),
			)
		}

		if (!span.parentSpanId && traceMetadata) {
			traceMetadata.destroy()
		}

		this.finishedSpanNames.add(span.name)

		// @ts-ignore
		super.onEnd(span)
	}

	onShutdown(): void {}

	async forceFlush(): Promise<void> {
		// @ts-ignore
		const finishedSpansCount = this._finishedSpans.length

		if (finishedSpansCount > 0) {
			Array.from(this._listeners.values()).forEach((listener) =>
				listener(),
			)
		}

		await super.forceFlush()
	}

	registerListener(listener: () => void) {
		const id = Symbol()
		this._listeners.set(id, listener)

		return () => this._listeners.delete(id)
	}
}

const OTEL_TO_OPTIONS = {
	[SEMRESATTRS_SERVICE_NAME]: 'serviceName',
	[SEMRESATTRS_SERVICE_VERSION]: 'serviceVersion',
	[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: 'environment',
} as const

export class Highlight {
	readonly FLUSH_TIMEOUT_MS = 30 * 1000
	_projectID: string
	_debug: boolean
	otel: NodeSDK
	private tracer: Tracer
	private processor: CustomSpanProcessor

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

		this.tracer = trace.getTracer('highlight-node')

		const config = {
			url: `${options.otlpEndpoint ?? OTLP_HTTP}/v1/traces`,
			compression:
				!process.env.NEXT_RUNTIME ||
				process.env.NEXT_RUNTIME === 'nodejs'
					? CompressionAlgorithm.GZIP
					: undefined,
			keepAlive: true,
			timeoutMillis: this.FLUSH_TIMEOUT_MS,
			httpAgentOptions: {
				timeout: this.FLUSH_TIMEOUT_MS,
				keepAlive: true,
			},
		}
		this._log('using otlp exporter settings', config)
		const exporter = new OTLPTraceExporter(config)

		this.processor = new CustomSpanProcessor(exporter, {
			scheduledDelayMillis: 1000,
			maxExportBatchSize: 1024 * 1024,
			maxQueueSize: 1024 * 1024,
			exportTimeoutMillis: this.FLUSH_TIMEOUT_MS,
		})

		const attributes: Attributes = options.attributes || {}
		attributes['highlight.project_id'] = this._projectID

		for (const [otelAttr, option] of Object.entries(OTEL_TO_OPTIONS)) {
			if (options[option]) {
				attributes[otelAttr] = options[option]
			}
		}

		this.otel = new NodeSDK({
			autoDetectResources: true,
			resourceDetectors: [processDetectorSync],
			resource: new Resource(attributes),
			spanProcessors: [this.processor],
			traceExporter: exporter,
			contextManager: new AsyncLocalStorageContextManager(),
			sampler: new AlwaysOnSampler(),
			instrumentations,
		})
		this.otel.start()

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

	get activeSpanProcessor(): CustomSpanProcessor {
		// @ts-ignore
		return trace.getTracerProvider()?._delegate.activeSpanProcessor
			._spanProcessors[0]
	}

	get finishedSpans(): Span[] {
		const processor = this.activeSpanProcessor
		// @ts-ignore
		return processor?._finishedSpans ?? []
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

	recordMetric(
		secureSessionId: string,
		name: string,
		value: number,
		requestId?: string,
		tags?: { name: string; value: string }[],
	) {
		if (!this.tracer) return
		const span = this.tracer.startSpan('highlight.metric')
		span.addEvent('metric', {
			['highlight.project_id']: this._projectID,
			['metric.name']: name,
			['metric.value']: value,
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
		for (const t of tags || []) {
			span.setAttribute(t.name, t.value)
		}
		span.end()
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
		if (!this.tracer) return
		const span = this.tracer.startSpan('highlight.log')
		// log specific events from https://github.com/highlight/highlight/blob/19ea44c616c432ef977c73c888c6dfa7d6bc82f3/sdk/highlight-go/otel.go#L34-L36
		span.addEvent(
			'log',
			{
				...(metadata ?? {}),
				// pass stack so that error creation on our end can show a structured stacktrace for errors
				['exception.stacktrace']: JSON.stringify(stack),
				['highlight.project_id']: this._projectID,
				['log.severity']: level,
				['log.message']: msg,
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
			},
			date,
		)
		span.end()
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
		if (requestId) {
			span.setAttribute('highlight.trace_id', requestId)
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
		} catch (e) {
			this._log('failed to flush: ', e)
		}
	}

	async waitForFlush(expectedSpanNames: string[] = []) {
		return new Promise<string[]>(async (resolve) => {
			let resolved = false
			let finishedSpansCount = this.finishedSpans.length
			let waitingForFinishedSpans = finishedSpansCount > 0

			let intervalTimer = setInterval(async () => {
				finishedSpansCount = this.finishedSpans.length

				const canFinish =
					!expectedSpanNames.length ||
					expectedSpanNames.every((n) =>
						this.processor.getFinishedSpanNames().has(n),
					)

				if (finishedSpansCount) {
					waitingForFinishedSpans = true
				} else if (canFinish && waitingForFinishedSpans) {
					finish()

					this.processor.clearFinishedSpanNames()
				}
			}, 10)

			this.flush()

			let timer: ReturnType<typeof setTimeout>

			const finish = async () => {
				clearInterval(intervalTimer)
				clearTimeout(timer)
				unlisten()

				if (!resolved) {
					resolved = true

					resolve(Array.from(this.processor.getFinishedSpanNames()))
				}
			}

			if (!expectedSpanNames.length) {
				timer = setTimeout(finish, 2000)
			}

			const unlisten = this.processor.registerListener(finish)
		})
	}

	setAttributes(attributes: Attributes) {
		return this.otel.addResource(new Resource(attributes))
	}

	parseHeaders(headers: Headers | IncomingHttpHeaders): HighlightContext {
		return parseHeaders(headers)
	}

	async runWithHeaders<T>(
		headers: Headers | IncomingHttpHeaders,
		cb: (span: OtelSpan) => T | Promise<T>,
	) {
		const { secureSessionId, requestId } = this.parseHeaders(headers)
		const { span, ctx } = await this.startWithHeaders(
			'highlight-ctx',
			headers,
		)
		try {
			return await api.context.with(ctx, async () => {
				return cb(span)
			})
		} catch (error) {
			if (error instanceof Error) {
				this.consumeCustomError(error, secureSessionId, requestId)
			}

			throw error
		} finally {
			span.end()
			await this.waitForFlush()
		}
	}

	startWithHeaders<T>(
		spanName: string,
		headers: Headers | IncomingHttpHeaders,
		options?: SpanOptions,
	): { span: OtelSpan; ctx: Context } {
		const ctx = api.context.active()
		const span = this.tracer.startSpan(spanName, options, ctx)
		const contextWithSpanSet = api.trace.setSpan(ctx, span)

		const { secureSessionId, requestId } = this.parseHeaders(headers)
		if (secureSessionId && requestId) {
			this.processor.setTraceMetadata(span, {
				'highlight.session_id': secureSessionId,
				'highlight.trace_id': requestId,
			})

			propagation.getActiveBaggage()?.setEntry(HIGHLIGHT_REQUEST_HEADER, {
				value: `${secureSessionId}/${requestId}`,
			} as BaggageEntry)
		}

		return { span, ctx: contextWithSpanSet }
	}

	startActiveSpan(name: string, options?: SpanOptions) {
		return new Promise<OtelSpan>((resolve) =>
			this.tracer.startActiveSpan(name, options || {}, resolve),
		)
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

function extractIncomingHttpHeaders(
	headers?: Headers | IncomingHttpHeaders,
): IncomingHttpHeaders {
	if (headers) {
		let requestHeaders: IncomingHttpHeaders = {}
		if (headers instanceof Headers) {
			headers.forEach((value, key) => (requestHeaders[key] = value))
		} else if (headers) {
			requestHeaders = headers
		}

		return requestHeaders
	} else {
		return { secureSessionId: undefined, requestId: undefined }
	}
}

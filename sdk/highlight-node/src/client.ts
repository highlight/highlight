import { BufferConfig, Span } from '@opentelemetry/sdk-trace-base'
import { BatchSpanProcessorBase } from '@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase'

import type { Attributes, Tracer } from '@opentelemetry/api'
import { trace } from '@opentelemetry/api'
import { NodeOptions } from './types.js'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { hookConsole } from './hooks'
import log from './log'
import { clearInterval } from 'timers'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { processDetectorSync, Resource } from '@opentelemetry/resources'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'

const OTLP_HTTP = 'https://otel.highlight.io:4318'

// @ts-ignore
class CustomSpanProcessor extends BatchSpanProcessorBase<BufferConfig> {
	private _listeners: Map<Symbol, () => void>

	constructor(config: any, options: any) {
		super(config, options)

		this._listeners = new Map()
	}

	onShutdown(): void {}

	async forceFlush(): Promise<void> {
		// @ts-ignore
		const finishedSpansCount = this._finishedSpans.length

		await super.forceFlush()

		if (finishedSpansCount > 0) {
			Array.from(this._listeners.values()).forEach((listener) =>
				listener(),
			)
		}
	}

	registerListener(listener: () => void) {
		const id = Symbol()
		this._listeners.set(id, listener)

		return () => this._listeners.delete(id)
	}
}

export class Highlight {
	readonly FLUSH_TIMEOUT = 10
	_intervalFunction: ReturnType<typeof setInterval>
	_projectID: string
	_debug: boolean
	otel: NodeSDK
	private tracer: Tracer
	private processor: CustomSpanProcessor

	constructor(options: NodeOptions) {
		this._debug = !!options.debug
		this._projectID = options.projectID
		if (!options.disableConsoleRecording) {
			hookConsole(options.consoleMethodsToRecord, (c) => {
				this.log(c.date, c.message, c.level, c.stack)
			})
		}

		if (!this._projectID) {
			console.warn(
				'Highlight project id was not provided. Data will not be recorded.',
			)
		}

		this.tracer = trace.getTracer('highlight-node')

		const exporter = new OTLPTraceExporter({
			compression: CompressionAlgorithm.GZIP,
			url: `${options.otlpEndpoint ?? OTLP_HTTP}/v1/traces`,
		})

		this.processor = new CustomSpanProcessor(exporter, {
			scheduledDelayMillis: 1000,
			maxExportBatchSize: 128,
			maxQueueSize: 1024,
		})

		const attributes: Attributes = {}
		attributes['highlight.project_id'] = this._projectID

		if (options.serviceName) {
			attributes[SemanticResourceAttributes.SERVICE_NAME] =
				options.serviceName
		}

		if (options.serviceVersion) {
			attributes[SemanticResourceAttributes.SERVICE_VERSION] =
				options.serviceVersion
		}

		this.otel = new NodeSDK({
			autoDetectResources: true,
			resourceDetectors: [processDetectorSync],
			resource: {
				attributes,
				merge: (resource) =>
					new Resource({
						...(resource?.attributes ?? {}),
						...attributes,
					}),
			},
			spanProcessor: this.processor,
			traceExporter: exporter,
			instrumentations: [
				getNodeAutoInstrumentations({
					'@opentelemetry/instrumentation-fs': {
						enabled: options.enableFsInstrumentation ?? false,
					},
				}),
			],
		})
		this.otel.start()

		this._intervalFunction = setInterval(
			() => this.flush(),
			this.FLUSH_TIMEOUT * 1000,
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
		const finishedSpans: CustomSpanProcessor['_finishedSpans'] =
			// @ts-ignore
			processor?._finishedSpans ?? []

		return finishedSpans
	}

	async stop() {
		await this.flush()
		await this.otel.shutdown()
		if (this._intervalFunction) {
			clearInterval(this._intervalFunction)
		}
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
		const span = this.tracer.startSpan('highlight-ctx')
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
		const span = this.tracer.startSpan('highlight-ctx')
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
	) {
		const span = this.tracer.startSpan('highlight-ctx')
		span.recordException(error)
		if (metadata != undefined) {
			span.setAttributes(metadata)
		}
		if (secureSessionId) {
			span.setAttributes({ ['highlight.session_id']: secureSessionId })
		}
		if (requestId) {
			span.setAttributes({ ['highlight.trace_id']: requestId })
		}
		this._log('created error span', span)
		span.end()
	}

	async flush() {
		await this.processor
			.forceFlush()
			.catch((e) => console.warn('highlight-node failed to flush: ', e))
	}

	async waitForFlush() {
		return new Promise<void>(async (resolve) => {
			let resolved = false
			let waitingForFinishedSpans = false

			await this.flush()

			let intervalTimer = setInterval(async () => {
				const finishedSpansCount = this.finishedSpans.length

				if (finishedSpansCount) {
					waitingForFinishedSpans = true
				} else if (waitingForFinishedSpans) {
					finish()
				}
			}, 10)
			let timer = setTimeout(finish, 10000)
			function finish() {
				intervalTimer && clearInterval(intervalTimer)
				timer && clearTimeout(timer)
				unlisten()

				if (!resolved) {
					resolved = true
					resolve()
				}
			}

			const unlisten = this.processor.registerListener(finish)
		})
	}

	setAttributes(attributes: Attributes) {
		return this.otel.addResource(new Resource(attributes))
	}
}

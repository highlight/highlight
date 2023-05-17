import {
	BatchSpanProcessor,
	SpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { Tracer, trace } from '@opentelemetry/api'

import { NodeOptions } from './types.js'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { hookConsole } from './hooks'
import log from './log'

const OTLP_HTTP = 'https://otel.highlight.io:4318'

export class Highlight {
	readonly FLUSH_TIMEOUT = 10
	_intervalFunction: ReturnType<typeof setInterval>
	_projectID: string
	_debug: boolean
	private otel: NodeSDK
	private tracer: Tracer
	private processor: SpanProcessor

	constructor(options: NodeOptions) {
		this._debug = !!options.debug
		this._projectID = options.projectID
		if (!options.disableConsoleRecording) {
			hookConsole(options.consoleMethodsToRecord, (c) => {
				this.log(c.date, c.message, c.level, c.stack)
			})
		}

		this.tracer = trace.getTracer('highlight-node')

		const exporter = new OTLPTraceExporter({
			url: `${options.otlpEndpoint ?? OTLP_HTTP}/v1/traces`,
		})

		this.processor = new BatchSpanProcessor(exporter, {})
		this.otel = new NodeSDK({
			autoDetectResources: true,
			resource: {
				attributes: { 'highlight.project_id': this._projectID },
				merge: (resource) =>
					new Resource({
						...(resource?.attributes ?? {}),
						'highlight.project_id': this._projectID,
					}),
			},
			spanProcessor: this.processor,
			traceExporter: exporter,
			instrumentations: [getNodeAutoInstrumentations()],
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
	) {
		if (!this.tracer) return
		const span = this.tracer.startSpan('highlight-ctx')
		// log specific events from https://github.com/highlight/highlight/blob/19ea44c616c432ef977c73c888c6dfa7d6bc82f3/sdk/highlight-go/otel.go#L34-L36
		span.addEvent(
			'log',
			{
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
	) {
		const span = this.tracer.startSpan('highlight-ctx')
		span.recordException(error)
		span.setAttributes({ ['highlight.project_id']: this._projectID })
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
		await this.processor.forceFlush()
	}
}

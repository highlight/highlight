import {
	getSdk,
	InputMaybe,
	MetricInput,
	PushMetricsMutationVariables,
	Sdk,
} from './graph/generated/operations'
import { GraphQLClient } from 'graphql-request'
import { NodeOptions } from './types.js'
import log from './log'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { trace, Tracer } from '@opentelemetry/api'
import { hookConsole } from './hooks'
import {
	BatchSpanProcessor,
	SpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeSDK } from '@opentelemetry/sdk-node'

const OTLP_HTTP = 'https://otel.highlight.io:4318'

export class Highlight {
	readonly FLUSH_TIMEOUT = 10
	readonly BACKEND_SETUP_TIMEOUT = 15 * 60 * 1000
	_graphqlSdk: Sdk
	_backendUrl: string
	_intervalFunction: ReturnType<typeof setInterval>
	metrics: Array<InputMaybe<MetricInput>> = []
	lastBackendSetupEvent: number = 0
	_projectID: string
	_debug: boolean
	private otel: NodeSDK
	private tracer: Tracer
	private processor: SpanProcessor

	constructor(options: NodeOptions) {
		this._debug = !!options.debug
		this._projectID = options.projectID
		this._backendUrl = options.backendUrl || 'https://pub.highlight.run'
		if (!options.disableConsoleRecording) {
			hookConsole(options.consoleMethodsToRecord, (c) => {
				this.log(c.date, c.message, c.level, c.stack)
			})
		}
		const client = new GraphQLClient(this._backendUrl, {
			headers: {},
		})
		this._graphqlSdk = getSdk(client)

		this.tracer = trace.getTracer('highlight-node')

		const exporter = new OTLPTraceExporter({
			url: `${options.otlpEndpoint ?? OTLP_HTTP}/v1/traces`,
		})

		this.processor = new BatchSpanProcessor(exporter, {})
		this.otel = new NodeSDK({
			autoDetectResources: true,
			defaultAttributes: { 'highlight.project_id': this._projectID },
			spanProcessor: this.processor,
			traceExporter: exporter,
			instrumentations: [getNodeAutoInstrumentations()],
		})
		this.otel.start()

		this._intervalFunction = setInterval(
			() => this.flush(),
			this.FLUSH_TIMEOUT * 1000,
		)

		this._graphqlSdk
			.MarkBackendSetup({
				project_id: this._projectID,
			})
			.then(() => {
				this.lastBackendSetupEvent = Date.now()
			})
			.catch((e) => {
				console.warn('highlight-node error: ', e)
			})
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
		this.metrics.push({
			session_secure_id: secureSessionId,
			group: requestId,
			name: name,
			value: value,
			category: 'BACKEND',
			timestamp: new Date().toISOString(),
			tags: tags,
		})
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
		let span = trace.getActiveSpan()
		let spanCreated = false
		if (!span) {
			span = this.tracer.startSpan('highlight-ctx')
			spanCreated = true
		}
		span.recordException(error)
		span.setAttributes({ ['highlight.project_id']: this._projectID })
		if (secureSessionId) {
			span.setAttributes({ ['highlight.session_id']: secureSessionId })
		}
		if (requestId) {
			span.setAttributes({ ['highlight.trace_id']: requestId })
		}
		if (spanCreated) {
			this._log('created error span', span)
			span.end()
		} else {
			this._log('updated current span with error', span)
		}
	}

	consumeCustomEvent(secureSessionId?: string) {
		const sendBackendSetup =
			Date.now() - this.lastBackendSetupEvent > this.BACKEND_SETUP_TIMEOUT
		if (sendBackendSetup) {
			this._graphqlSdk
				.MarkBackendSetup({
					project_id: this._projectID,
					session_secure_id: secureSessionId,
				})
				.then(() => {
					this.lastBackendSetupEvent = Date.now()
				})
				.catch((e) => {
					console.warn('highlight-node error: ', e)
				})
		}
	}

	async flushMetrics() {
		if (this.metrics.length === 0) {
			return
		}
		const variables: PushMetricsMutationVariables = {
			metrics: this.metrics,
		}
		this.metrics = []
		try {
			await this._graphqlSdk.PushMetrics(variables)
		} catch (e) {
			console.warn('highlight-node pushMetrics error: ', e)
		}
	}

	async flush() {
		await Promise.all([this.flushMetrics(), this.processor.forceFlush()])
	}
}

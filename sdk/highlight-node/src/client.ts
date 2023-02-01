import {
	getSdk,
	InputMaybe,
	MetricInput,
	PushMetricsMutationVariables,
	Sdk,
} from './graph/generated/operations'
import { GraphQLClient } from 'graphql-request'
import { NodeOptions } from './types.js'
import { ErrorContext } from './errorContext.js'

import * as opentelemetry from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import {
	BasicTracerProvider,
	BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { trace, Tracer } from '@opentelemetry/api'

const OTLP_HTTP = 'https://otel.highlight.io:4318'

export class Highlight {
	readonly FLUSH_TIMEOUT = 10
	readonly BACKEND_SETUP_TIMEOUT = 15 * 60 * 1000
	_graphqlSdk: Sdk
	_backendUrl: string
	_intervalFunction: ReturnType<typeof setInterval>
	metrics: Array<InputMaybe<MetricInput>> = []
	lastBackendSetupEvent: number = 0
	_errorContext: ErrorContext | undefined
	_projectID: string
	private otel: opentelemetry.NodeSDK
	private tracer: Tracer

	constructor(options: NodeOptions) {
		this._backendUrl = options.backendUrl || 'https://pub.highlight.run'
		const client = new GraphQLClient(this._backendUrl, {
			headers: {},
		})
		this._graphqlSdk = getSdk(client)

		const provider = new BasicTracerProvider()
		const exporter = new OTLPTraceExporter({
			url: `${OTLP_HTTP}/v1/traces`,
		})
		provider.addSpanProcessor(new BatchSpanProcessor(exporter))
		provider.register()

		this.otel = new opentelemetry.NodeSDK({
			traceExporter: exporter,
			instrumentations: [getNodeAutoInstrumentations()],
		})
		this.otel.start()

		this.tracer = trace.getTracer('highlight-node')

		this._intervalFunction = setInterval(
			() => this.flush(),
			this.FLUSH_TIMEOUT * 1000,
		)
		if (!options.disableErrorSourceContext) {
			this._errorContext = new ErrorContext({
				sourceContextCacheSizeMB: options.errorSourceContextCacheSizeMB,
			})
		}
		this._projectID = options.projectID
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

	consumeCustomError(
		error: Error,
		secureSessionId: string | undefined,
		requestId: string | undefined,
	) {
		let span = trace.getActiveSpan()
		if (!span) {
			span = this.tracer.startSpan('highlight-ctx')
		}
		span.recordException(error)
		span.setAttributes({
			highlight_project_id: this._projectID,
			highlight_session_id: secureSessionId,
			highlight_trace_id: requestId,
		})
		span.end()
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
		await Promise.all([this.flushMetrics()])
	}
}

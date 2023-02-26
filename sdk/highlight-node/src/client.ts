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

import * as opentelemetry from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import {
	diag,
	DiagConsoleLogger,
	DiagLogLevel,
	trace,
	Tracer,
} from '@opentelemetry/api'

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
	private otel: opentelemetry.NodeSDK
	private tracer: Tracer

	constructor(options: NodeOptions) {
		this._debug = !!options.debug
		this._projectID = options.projectID
		this._backendUrl = options.backendUrl || 'https://pub.highlight.run'
		const client = new GraphQLClient(this._backendUrl, {
			headers: {},
		})
		this._graphqlSdk = getSdk(client)

		if (options.debug) {
			diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
		}

		this.tracer = trace.getTracer('highlight-node')
		const exporter = new OTLPTraceExporter({
			url: `${options.otlpEndpoint ?? OTLP_HTTP}/v1/traces`,
		})

		this.otel = new opentelemetry.NodeSDK({
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
		span.setAttributes({
			['highlight.project_id']: this._projectID,
			['highlight.session_id']: secureSessionId,
			['highlight.trace_id']: requestId,
		})
		if (spanCreated) {
			span.end()
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
		await Promise.all([this.flushMetrics()])
	}
}

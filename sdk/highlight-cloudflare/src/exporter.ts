import type { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import type { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import type { ExportResult, ExportResultCode } from '@opentelemetry/core'
import type { SpanExporter } from '@opentelemetry/sdk-trace-web'
import type {
	Aggregation,
	AggregationTemporality,
	InstrumentType,
	PushMetricExporter,
} from '@opentelemetry/sdk-metrics'

import {
	JsonMetricsSerializer,
	JsonTraceSerializer,
} from '@opentelemetry/otlp-transformer'

type TraceExporterConfig = ConstructorParameters<typeof OTLPTraceExporter>[0]
type MetricExporterConfig = ConstructorParameters<typeof OTLPMetricExporter>[0]

export class OTLPTraceExporterFetch implements SpanExporter {
	private readonly url: string
	private readonly fetchConfig: RequestInit

	constructor(config?: TraceExporterConfig) {
		this.url = config?.url ?? '/v1/traces'
		this.fetchConfig = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		}
	}

	async shutdown(): Promise<void> {
		// noop
	}

	async forceFlush?(): Promise<void> {
		// noop
	}

	export(items: any, resultCallback: (result: ExportResult) => void) {
		;(async () => {
			const body = JsonTraceSerializer.serializeRequest(items)
			const r = await fetch(this.url, {
				...this.fetchConfig,
				body,
			})
			if (r.ok) {
				resultCallback({
					code: 0 as ExportResultCode.SUCCESS,
				})
			} else {
				resultCallback({
					code: 1 as ExportResultCode.FAILED,
					error: new Error(await r.text()),
				})
			}
		})()
	}
}

export class OTLPMetricExporterFetch implements PushMetricExporter {
	private readonly url: string
	private readonly fetchConfig: RequestInit

	constructor(config?: MetricExporterConfig) {
		this.url = config?.url ?? '/v1/traces'
		this.fetchConfig = {
			headers: {
				'Content-Type': 'application/json',
			},
		}
	}

	async forceFlush(): Promise<void> {
		// noop
	}
	selectAggregationTemporality?(
		instrumentType: InstrumentType,
	): AggregationTemporality {
		throw new Error('Method not implemented.')
	}
	selectAggregation?(instrumentType: InstrumentType): Aggregation {
		throw new Error('Method not implemented.')
	}
	async shutdown(): Promise<void> {
		// noop
	}

	export(items: any, resultCallback: (result: ExportResult) => void) {
		;(async () => {
			const body = JsonMetricsSerializer.serializeRequest(items)
			const r = await fetch(this.url, {
				...this.fetchConfig,
				body,
			})
			if (r.ok) {
				resultCallback({
					code: 0 as ExportResultCode.SUCCESS,
				})
			} else {
				resultCallback({
					code: 1 as ExportResultCode.FAILED,
					error: new Error(await r.text()),
				})
			}
		})()
	}
}

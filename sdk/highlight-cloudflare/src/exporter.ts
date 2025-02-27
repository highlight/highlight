import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import {
	JsonTraceSerializer,
	JsonMetricsSerializer,
} from '@opentelemetry/otlp-transformer'
import type { ExportResult, ExportResultCode } from '@opentelemetry/core'

type TraceExporterConfig = ConstructorParameters<typeof OTLPTraceExporter>[0]
type MetricExporterConfig = ConstructorParameters<typeof OTLPMetricExporter>[0]

export class OTLPTraceExporterFetch extends OTLPTraceExporter {
	private readonly url: string
	private readonly fetchConfig: RequestInit

	constructor(config?: TraceExporterConfig) {
		super(config)
		this.url = config?.url ?? '/v1/traces'
		this.fetchConfig = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		}
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

export class OTLPMetricExporterFetch extends OTLPMetricExporter {
	private readonly url: string
	private readonly fetchConfig: RequestInit

	constructor(config?: MetricExporterConfig) {
		super(config)
		this.url = config?.url ?? '/v1/traces'
		this.fetchConfig = {
			headers: {
				'Content-Type': 'application/json',
			},
		}
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

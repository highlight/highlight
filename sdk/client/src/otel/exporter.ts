import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import type { ReadableSpan } from '@opentelemetry/sdk-trace-web'
import { OTLPExporterError } from '@opentelemetry/otlp-exporter-base'
import { MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS } from '../utils/graph'

type ExporterConfig = ConstructorParameters<typeof OTLPTraceExporter>[0]
type SendOnErrorCallback = Parameters<OTLPTraceExporter['send']>[2]

// This custom exporter is a temporary workaround for an issue we are having
// with requests stalling in the browser using the sendBeacon API. There is work
// being done to improve this by the OTEL team, but in the meantime we are using
// this custom exporter which will retry failed requests and send the data with
// an XHR request. More info:
// - https://github.com/open-telemetry/opentelemetry-js/issues/3489
// - https://github.com/open-telemetry/opentelemetry-js/blob/cf8edbed43c3e54eadcafe6fc6f39a1d03c89aa7/experimental/packages/otlp-exporter-base/src/platform/browser/OTLPExporterBrowserBase.ts#L51-L52

export class OTLPTraceExporterBrowserWithXhrRetry extends OTLPTraceExporter {
	private readonly xhrTraceExporter: OTLPTraceExporter

	constructor(config?: ExporterConfig) {
		super(config)
		this.xhrTraceExporter = new OTLPTraceExporter({
			...(config ?? {}),
			headers: {}, // a truthy value enables sending with XHR instead of beacon
		})
	}

	send(
		items: ReadableSpan[],
		onSuccess: () => void,
		onError: SendOnErrorCallback,
	): void {
		let retries = 0
		const retry = (error: OTLPExporterError) => {
			retries++
			if (retries > MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS) {
				console.error(
					`[highlight.io] failed to export OTeL traces: ${error.message}`,
					error,
				)
				onError(error)
			} else {
				this.xhrTraceExporter.send(items, onSuccess, retry)
			}
		}

		super.send(items, onSuccess, retry)
	}
}

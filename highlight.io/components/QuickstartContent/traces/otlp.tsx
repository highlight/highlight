import { QuickStartContent } from '../QuickstartContent'
import { verifyTraces } from './shared-snippets'

export const OTLPTracesContent: QuickStartContent = {
	title: 'Tracing via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Learn how to export traces to highlight.io via one of the OpenTelemetry SDKs.`,
	entries: [
		{
			title: 'Export your traces to the highlight.io collector.',
			content:
				'We host an OpenTelemetry collector endpoint at https://otel.highlight.io:4318/v1/traces. Configure your OpenTelemetry SDK to send traces via OTLP HTTPS to this endpoint. This will depend on which SDK you use in your app.',
			code: [
				{
					text: `import * as opentelemetry from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

const sdk = new opentelemetry.NodeSDK({
	traceExporter: new OTLPTraceExporter({
		url: 'https://otel.highlight.io:4318/v1/traces',
	}),
});
sdk.start();`,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}

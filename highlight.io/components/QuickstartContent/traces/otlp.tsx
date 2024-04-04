import { QuickStartContent } from '../QuickstartContent'
import { verifyTraces } from './shared-snippets'

export const OTLPTracesContent: QuickStartContent = {
	title: 'Tracing via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Learn how to export traces to highlight.io via one of the OpenTelemetry SDKs.`,
	entries: [
		{
			title: 'Export your traces to the highlight.io collector.',
			content:
				'We host an OpenTelemetry collector endpoint at https://otel.highlight.io:4318/v1/traces. Configure your OpenTelemetry SDK to send traces via OTLP HTTPS to this endpoint. Your Highlight Project ID should be included as an attribute with the `highlight.project_id` key. This configuration will depend on which SDK you use in your app.',
			code: [
				{
					text: `import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources'
import type { Attributes } from '@opentelemetry/api'

const attributes: Attributes = {
    'highlight.project_id': '<YOUR_PROJECT_ID>'
}
const sdk = new NodeSDK({
	resource: new Resource(attributes),
	traceExporter: new OTLPTraceExporter({
		url: 'https://otel.highlight.io:4318/v1/traces'
	})
});
sdk.start();`,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}

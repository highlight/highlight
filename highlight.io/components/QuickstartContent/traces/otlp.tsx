import { QuickStartContent } from '../QuickstartContent'
import { verifyTraces } from './shared-snippets'

export const OTLPTracesContent: QuickStartContent = {
	title: 'Tracing via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Learn how to export traces to highlight.io via one of the OpenTelemetry SDKs.`,
	entries: [
		{
			title: 'Export your traces to the highlight.io collector.',
			content:
				'We host an [OpenTelemetry collector](https://opentelemetry.io/docs/concepts/signals/traces/) endpoint at https://otel.highlight.io:4318/v1/traces. Configure your OpenTelemetry SDK to send traces via OTLP HTTPS to this endpoint. Your Highlight Project ID should be included as an attribute with the `highlight.project_id` key. This configuration will depend on which SDK you use in your app.',
			code: [
				{
					text: `import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources'
import type { Attributes } from '@opentelemetry/api'

const attributes: Attributes = {
    // Provide the highlight project ID as a resource attribute or via the exporter headers
    'highlight.project_id': '<YOUR_PROJECT_ID>'
}
const sdk = new NodeSDK({
	resource: new Resource(attributes),
	traceExporter: new OTLPTraceExporter({
		// NB: this is the url for trace exports. if you are using a language which supports
		// the opentelemetry logs format, use 'https://otel.highlight.io:4318/v1/logs'
		url: 'https://otel.highlight.io:4318/v1/traces'
		// In some OpenTelemetry implementations, it's easier to provide 
		// the project ID as a header rather than a resource attribute.
		// headers: { 'x-highlight-project': '<YOUR_PROJECT_ID>' }
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

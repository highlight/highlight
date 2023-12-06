import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const OTLPLoggingContent: QuickStartContent = {
	title: 'Logging via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Learn how to export logs to highlight.io via one of the OpenTelemetry SDKs.`,
	entries: [
		{
			title: 'Export your logs to the highlight.io collector.',
			content:
				'We host an OpenTelemetry collector endpoint at https://otel.highlight.io:4318/v1/traces. Configure your OpenTelemetry SDK to send logs via OTLP HTTPS to this endpoint. Your Highlight Project ID should be included as an attribute with the `highlight.project_id` key. This configuration will depend on which SDK you use in your app.',
			code: [
				{
					text: `import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
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
const tracer = trace.getTracer('my-service');
sdk.start();

const log = (level: string, message: string) => {
    const span = tracer.startSpan('main')
    span.setAttributes({ 
    	['highlight.session_id']: 'abc123',
    	['highlight.trace_id']: 'def456',
    	customer: 'vadim',
    	customer_id: 1234
    })
    
    span.addEvent('log', {
	    ['log.severity']: level,
	    ['log.message']: message
	}, new Date())
    span.end()
};

log('info', 'hello, world!')
`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}

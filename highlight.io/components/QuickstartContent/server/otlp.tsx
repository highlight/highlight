import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets-logging'
import { verifyErrors } from './shared-snippets-monitoring'
import { verifyTraces } from './shared-snippets-tracing'

export const OTLPReorganizedContent: QuickStartContent = {
	title: 'OpenTelemetry Protocol',
	subtitle: `Learn how to export data to highlight.io via one of the OpenTelemetry SDKs.`,
	logoKey: 'javascript',
	products: ['Logs', 'Errors', 'Traces'],
	entries: [
		{
			title: 'Export your errors to the highlight.io collector.',
			content:
				'We host an OpenTelemetry collector endpoint at https://otel.highlight.io:4318/v1/traces and https://otel.highlight.io:4318/v1/logs. Configure your OpenTelemetry SDK to send errors via OTLP HTTPS to this endpoint. Your Highlight Project ID should be included as an attribute with the `highlight.project_id` key. This configuration will depend on which SDK you use in your app.',
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
const tracer = trace.getTracer('my-service');
sdk.start();

const main = () => {
    const span = tracer.startSpan('main')
    span.setAttributes({ 
    	['highlight.session_id']: 'abc123',
    	['highlight.trace_id']: 'def456',
    	customer: 'vadim',
    	customer_id: 1234
    })
    try {
		throw new Error('This is an example error');
	} catch (error) {
        span.recordException(error)
	} finally {
        span.end()
	}
};

main();
`,
					language: 'js',
				},
			],
		},
		verifyErrors,
		{
			title: 'Export your logs to the highlight.io collector.',
			content:
				'We host an OpenTelemetry collector endpoint at https://otel.highlight.io:4318/v1/traces and https://otel.highlight.io:4318/v1/logs. Configure your OpenTelemetry SDK to send logs via OTLP HTTPS to this endpoint. Your Highlight Project ID should be included as an attribute with the `highlight.project_id` key. This configuration will depend on which SDK you use in your app.',
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

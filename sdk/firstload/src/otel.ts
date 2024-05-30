import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	SimpleSpanProcessor,
	WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { Resource } from '@opentelemetry/resources'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

let provider: WebTracerProvider

export const installOtel = () => {
	if (provider) {
		console.log('::: OTEL already installed :::')
		return
	}

	provider = new WebTracerProvider({
		resource: new Resource({
			'service.name': 'highlight-browser',
			'highlight.project_id': '1',
		}),
	})

	// Was not working and causing an error: "Zone is not defined"
	// provider.register({
	// 	contextManager: new ZoneContextManager(),
	// })

	// Export spans to console for debugging
	provider.addSpanProcessor(
		new SimpleSpanProcessor(new ConsoleSpanExporter()),
	)

	const exporter = new OTLPTraceExporter({
		url: 'https://localhost:4318/v1/traces', // TODO: Make dynamic
		// headers: {
		// 	'Content-Type': 'application/json',
		// },
		concurrencyLimit: 3,
	})
	// Can customize by passing a config object as 2nd param.
	provider.addSpanProcessor(new BatchSpanProcessor(exporter))

	registerInstrumentations({
		instrumentations: [
			new DocumentLoadInstrumentation(),
			new UserInteractionInstrumentation(),
			new XMLHttpRequestInstrumentation({
				ignoreUrls: [/.*rudderstack.*/],
			}),
		],
	})

	provider.register()
}

// instrumentation.ts or src/instrumentation.ts
import { registerOTel } from '@vercel/otel'

export async function register() {
	registerOTel({
		autoDetectResources: true,
		traceExporter: 'auto',
		serviceName: 'my-nextjs-instrumentation-vercel',
		attributes: {
			'highlight.project_id': '1383',
			'highlight.service_name': 'my-nextjs-instrumentation-attr-vercel',
		},
	})
}

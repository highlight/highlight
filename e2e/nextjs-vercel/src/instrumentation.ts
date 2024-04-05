// instrumentation.ts or src/instrumentation.ts
import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'

const HIGHLIGHT_REQUEST_HEADER = 'x-highlight-request'

export function register() {
	registerOTel({
		serviceName: 'my-nextjs-instrumentation-attr-vercel-sn',
		instrumentationConfig: {
			fetch: {
				propagateContextUrls: ['*'],
			},
		},
		traceExporter: new OTLPHttpJsonTraceExporter({
			url: 'https://otel.highlight.io:4318/v1/traces',
			// url: 'https://webhook.site/eb85fc4e-93a5-4215-9f8c-51591ac28b2f',
		}),
		attributesFromHeaders: (headers: any) => {
			const [session, trace] =
				headers[HIGHLIGHT_REQUEST_HEADER].split('/')
			return {
				'highlight.session_id': session,
				'highlight.trace_id': trace,
			}
		},
		attributes: {
			'highlight.project_id': '1383',
			'service.name': 'my-nextjs-instrumentation-attr-vercel',
		},
	})
}

// instrumentation.ts or src/instrumentation.ts
import { highlightConfig, isNodeJsRuntime } from '@/highlight.config'

export async function register() {
	if (isNodeJsRuntime()) {
		const { registerHighlight } = await import('@highlight-run/next/server')
		await registerHighlight({
			...highlightConfig,
			serviceName: highlightConfig.serviceName + '-register',
		})
	} else {
		const { registerOTel } = await import('@vercel/otel')
		registerOTel({
			autoDetectResources: true,
			traceExporter: 'auto',
			serviceName: 'my-nextjs-instrumentation-vercel',
			attributes: {
				'highlight.project_id': '1383',
				'highlight.service_name':
					'my-nextjs-instrumentation-attr-vercel',
			},
		})
	}
}

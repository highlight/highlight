// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from '@/constants'
import type { NodeOptions } from '@highlight-run/node'
import { isNodeJsRuntime } from '@highlight-run/next/server'
import { highlightConfig } from './highlight.config'

export async function register() {
	if (isNodeJsRuntime()) {
		console.log('Node JS runtime is running')
		const { registerHighlight } = await import('@highlight-run/next/server')
		await registerHighlight({
			...highlightConfig,
			serviceName: highlightConfig.serviceName + '-register',
		})
	} else {
		console.log('Vercel is running')
		const { registerOTel } = await import('@vercel/otel')
		registerOTel({
			autoDetectResources: true,
			traceExporter: 'auto',
			serviceName: 'my-nextjs-instrumentation-vercel',
			attributes: {
				'highlight.project_id': '1383',
				'service.name': 'my-nextjs-instrumentation-attr-vercel',
			},
		})
	}
}

// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from '@/constants'
import type { NodeOptions } from '@highlight-run/node'
import { registerOTel } from '@vercel/otel'
import { isNodeJsRuntime } from '@highlight-run/next/server'

export const highlightConfig = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'my-nextjs-instrumentation',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	debug: true,
	disableConsoleRecording: false,
} as NodeOptions

export async function register() {
	if (isNodeJsRuntime()) {
		const { registerHighlight } = await import('@highlight-run/next/server')
		await registerHighlight(highlightConfig)
	} else {
		process.env.OTEL_EXPORTER_OTLP_ENDPOINT =
			CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT
		registerOTel({
			...highlightConfig,
			autoDetectResources: true,
			attributes: {
				'highlight.project_id': '1383',
				'highlight.service_name': 'my-nextjs-backend-vercel',
			},
		})
	}
}

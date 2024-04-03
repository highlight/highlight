// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from '@/constants'
import type { NodeOptions } from '@highlight-run/node'

export const highlightConfig = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'my-nextjs-instrumentation',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	disableConsoleRecording: false,
	debug: false,
} as NodeOptions

export async function register() {
	const { registerHighlight } = await import('@highlight-run/next/server')
	await registerHighlight(highlightConfig)
}

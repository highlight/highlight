// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from '@/constants'
import type { NodeOptions } from '@highlight-run/node'

export function isNodeJsRuntime() {
	return (
		typeof process.env.NEXT_RUNTIME === 'undefined' ||
		process.env.NEXT_RUNTIME === 'nodejs'
	)
}

export const highlightConfig = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'my-nextjs-highlight-config',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	debug: true,
	disableConsoleRecording: false,
} as NodeOptions

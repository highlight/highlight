// src/app/utils/edge-highlight.config.ts:
import { EdgeHighlight, HighlightEnv } from '@highlight-run/next/server'

import { CONSTANTS } from '@/constants'
import type { NodeOptions } from '@highlight-run/node'

const highlightConfig = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'my-nextjs-instrumentation',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	disableConsoleRecording: false,
	debug: false,
} as NodeOptions

const env: HighlightEnv = {
	...highlightConfig,
	serviceName: 'my-nextjs-frontend-vercel-edge',
	environment: 'e2e-test',
}

export const withEdgeHighlight = EdgeHighlight(env)

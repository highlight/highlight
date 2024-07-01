// src/app/utils/edge-highlight.config.ts:
import { EdgeHighlight, HighlightEnv } from '@highlight-run/next/server'
import { highlightConfig } from '@/instrumentation'

const env: HighlightEnv = {
	...highlightConfig,
	serviceName: 'my-nextjs-frontend-vercel-edge',
	environment: 'e2e-test',
}

export const withEdgeHighlight = EdgeHighlight(env)

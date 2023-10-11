// src/app/utils/edge-highlight.config.ts:
import { EdgeHighlight, HighlightEnv } from '@highlight-run/next/server'

const env: HighlightEnv = {
	projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID || '2',
	otlpEndpoint: process.env.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'vercel-edge',
}

export const withEdgeHighlight = EdgeHighlight(env)

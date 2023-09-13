// src/app/utils/edge-highlight.config.ts:
import { Highlight, HighlightEnv } from '@highlight-run/next/edge'

const env: HighlightEnv = {
	projectId: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID || '2',
	otlpEndpoint: process.env.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'vercel-edge',
}

export const withHighlight = Highlight(env)

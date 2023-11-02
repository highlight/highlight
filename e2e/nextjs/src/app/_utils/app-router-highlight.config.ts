// src/app/utils/app-router-highlight.config.ts:
import { HighlightEnv, AppRouterHighlight } from '@highlight-run/next/server'
import { CONSTANTS } from '@/constants'

const env: HighlightEnv = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID || '2',
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'vercel-app-router',
}

export const withAppRouterHighlight = AppRouterHighlight(env)

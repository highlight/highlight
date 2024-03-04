// src/app/utils/app-router-highlight.config.ts:
import { CONSTANTS } from '@/constants'
import { AppRouterHighlight, HighlightEnv } from '@highlight-run/next/server'

const env: HighlightEnv = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID || '2',
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'vercel-app-router',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	disableConsoleRecording: true,
}

export const withAppRouterHighlight = AppRouterHighlight(env)

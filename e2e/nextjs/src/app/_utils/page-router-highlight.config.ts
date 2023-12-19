// src/app/utils/page-router-highlight.config.ts:
import { CONSTANTS } from '@/constants'
import { HighlightEnv, PageRouterHighlight } from '@highlight-run/next/server'

if (process.env.NODE_ENV === 'development') {
	// Highlight's dev instance expects HTTPS. Disable HTTPS errors in development.
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const env: HighlightEnv = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	backendUrl: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL,
	serviceName: 'vercel-page-router',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	disableConsoleRecording: true,
}

export const withPageRouterHighlight = PageRouterHighlight(env)

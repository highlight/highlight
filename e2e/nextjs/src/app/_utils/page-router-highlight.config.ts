// src/app/utils/page-router-highlight.config.ts:
import { highlightConfig } from '@/instrumentation'
import { HighlightEnv, PageRouterHighlight } from '@highlight-run/next/server'

if (process.env.NODE_ENV === 'development') {
	// Highlight's dev instance expects HTTPS. Disable HTTPS errors in development.
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const env: HighlightEnv = {
	...highlightConfig,
	serviceName: 'my-nextjs-frontend-vercel-page-router',
	environment: 'e2e-test',
}

export const withPageRouterHighlight = PageRouterHighlight(env)

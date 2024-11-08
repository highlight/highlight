// utils/app-router-highlight.config.ts:

import { highlightConfig } from '@/instrumentation'
import { AppRouterHighlight, HighlightEnv } from '@highlight-run/next/server'

const env: HighlightEnv = {
	...highlightConfig,
	serviceName: 'my-nextjs-frontend-vercel-app-router',
	environment: 'e2e-test',
}

export const withAppRouterHighlight = AppRouterHighlight(env)

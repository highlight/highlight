// src/app/utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from '@highlight-run/next/server'
import { highlightConfig } from '@/highlight.config'

export const withAppRouterHighlight = AppRouterHighlight({
	...highlightConfig,
	serviceName: highlightConfig.serviceName + '-app-router',
})

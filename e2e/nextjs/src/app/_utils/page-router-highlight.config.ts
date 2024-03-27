// src/app/utils/page-router-highlight.config.ts:
import { PageRouterHighlight } from '@highlight-run/next/server'
import { highlightConfig } from '@/highlight.config'

export const withPageRouterHighlight = PageRouterHighlight({
	...highlightConfig,
	serviceName: highlightConfig.serviceName + '-page-router',
})

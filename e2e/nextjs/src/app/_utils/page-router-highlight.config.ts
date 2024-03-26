// src/app/utils/page-router-highlight.config.ts:
import { CONSTANTS } from '@/constants'
import { HighlightEnv, PageRouterHighlight } from '@highlight-run/next/server'
import { highlightConfig } from '@/instrumentation'

if (process.env.NODE_ENV === 'development') {
	// Highlight's dev instance expects HTTPS. Disable HTTPS errors in development.
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export const withPageRouterHighlight = PageRouterHighlight(highlightConfig)

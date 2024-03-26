// src/app/utils/app-router-highlight.config.ts:
import { AppRouterHighlight, HighlightEnv } from '@highlight-run/next/server'
import { CONSTANTS } from '@/constants'
import { highlightConfig } from '@/instrumentation'

export const withAppRouterHighlight = AppRouterHighlight(highlightConfig)

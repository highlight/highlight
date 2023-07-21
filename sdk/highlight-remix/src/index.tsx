import React from 'react'
import { ReportDialog as ReactReportDialog } from '@highlight-run/react'
import { H } from '@highlight-run/node'
import type {
	AppLoadContext,
	DataFunctionArgs,
	EntryContext,
} from '@remix-run/node'
import { SESSION_STORAGE_KEYS } from '@highlight-run/client/src/utils/sessionStorage/sessionStorageKeys'

export function ReportDialog() {
	return typeof window === 'object' ? <ReactReportDialog /> : null
}

export function handleError(error: unknown, { request }: DataFunctionArgs) {
	if (error instanceof Error) {
		const flatHeaders = Object.fromEntries(request.headers.entries())
		const parsed = H.parseHeaders(flatHeaders)

		console.log('handleError', parsed?.secureSessionId, parsed?.requestId)
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
	}
}

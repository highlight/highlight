'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/react'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<HighlightErrorBoundary showDialog>{children}</HighlightErrorBoundary>
	)
}

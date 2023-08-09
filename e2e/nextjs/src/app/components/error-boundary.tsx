// src/app/components/error-boundary.tsx
'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<HighlightErrorBoundary
			showDialog={window.location.host !== 'localhost'}
		>
			{children}
		</HighlightErrorBoundary>
	)
}

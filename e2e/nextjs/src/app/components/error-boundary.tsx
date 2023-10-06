// src/app/components/error-boundary.tsx
'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	const isLocalhost =
		typeof window === 'object' && window.location.host === 'localhost'

	return (
		<HighlightErrorBoundary showDialog={!isLocalhost}>
			<>{children}</>
		</HighlightErrorBoundary>
	)
}

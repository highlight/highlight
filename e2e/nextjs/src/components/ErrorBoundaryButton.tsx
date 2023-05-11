'use client'

import {
	ErrorBoundary,
	SampleBuggyButton,
} from '@highlight-run/react/src/components'

export default function ErrorBoundaryButton() {
	return (
		<ErrorBoundary>
			<SampleBuggyButton />
		</ErrorBoundary>
	)
}

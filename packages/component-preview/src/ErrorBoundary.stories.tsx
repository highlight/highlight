import { ErrorBoundary, SampleBuggyButton } from '@highlight-run/react'

import React from 'react'

export const Basic: React.FC = () => {
	return (
		<ErrorBoundary showDialog>
			<SampleBuggyButton />
		</ErrorBoundary>
	)
}

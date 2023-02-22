import React from 'react'

import { ErrorBoundary, SampleBuggyButton } from '@highlight-run/react'

import '@highlight-run/react/dist/index.css'

export const Basic: React.FC = () => {
	return (
		<ErrorBoundary showDialog>
			<SampleBuggyButton />
		</ErrorBoundary>
	)
}

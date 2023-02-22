import React from 'react'
import { ErrorBoundary, SampleBuggyButton } from '@highlight-run/react'
import '@highlight-run/react/dist/index.css'
export const Basic = () => {
	return React.createElement(
		ErrorBoundary,
		{ showDialog: true },
		React.createElement(SampleBuggyButton, null),
	)
}

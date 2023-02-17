import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { SampleBuggyButton, ErrorBoundary } from '@highlight-run/react'
import { Box } from '../Box/Box'

import '@highlight-run/react/dist/index.css'

export default {
	title: 'Components/ErrorBoundary',
	component: ErrorBoundary,
} as ComponentMeta<typeof ErrorBoundary>

const Content: React.FC = () => {
	return (
		<Box mb="24">
			<ErrorBoundary showDialog>
				<SampleBuggyButton />
			</ErrorBoundary>
		</Box>
	)
}

export const Basic = () => (
	<>
		<Content />
	</>
)

import React from 'react'
import type { ComponentMeta } from '@storybook/react'

import { Box } from './Box'

export default {
	title: 'Components/Box',
	component: Box,
} as ComponentMeta<typeof Box>

export const Basic = () => (
	<Box
		background="p7"
		color="white"
		padding="24"
		borderRadius="6"
		border="primary"
	>
		Hello! 👋
	</Box>
)

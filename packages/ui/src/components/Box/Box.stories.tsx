import React from 'react'
import type { ComponentMeta } from '@storybook/react'

import { Box } from './Box'

export default {
	title: 'Components/Box',
	component: Box,
} as ComponentMeta<typeof Box>

export const Basic = () => (
	<Box
		background="purple700"
		color="white"
		padding="xxLarge"
		borderRadius="medium"
		border="neutralLarge"
	>
		Hello! 👋
	</Box>
)

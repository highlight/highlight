import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { IconButton } from './IconButton'

export default {
	title: 'Components/IconButton',
	component: IconButton,
} as ComponentMeta<typeof IconButton>

export const Basic = () => <IconButton>Hello! 👋</IconButton>

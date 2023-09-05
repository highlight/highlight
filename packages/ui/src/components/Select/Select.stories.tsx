import React from 'react'
import { Meta } from '@storybook/react'

import { Select } from './Select'

export default {
	title: 'Components/Select',
	component: Select,
} as Meta<typeof Select>

export const Basic = () => <Select>Hello! 👋</Select>

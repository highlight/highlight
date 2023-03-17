import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { HUI_MultiSelectCancel } from './HUI_MultiSelectCancel'

export default {
	title: 'Components/HUI_Select',
	component: HUI_MultiSelectCancel,
} as ComponentMeta<typeof HUI_MultiSelectCancel>

export const Basic = () => (
	<HUI_MultiSelectCancel>Hello! 👋</HUI_MultiSelectCancel>
)

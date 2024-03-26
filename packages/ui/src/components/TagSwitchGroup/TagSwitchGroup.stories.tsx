import React from 'react'
import { ComponentMeta } from '@storybook/react-vite'

import { TagSwitchGroup } from './TagSwitchGroup'

export default {
	title: 'Components/TagSwitchGroup',
	component: TagSwitchGroup,
} as ComponentMeta<typeof TagSwitchGroup>

export const Basic = () => <TagSwitchGroup>Hello! 👋</TagSwitchGroup>

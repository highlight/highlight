import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Text } from './Text'

export default {
	title: 'Text',
	component: Text,
} as ComponentMeta<typeof Text>

export const Basic = () => <Text>Hello! 👋</Text>

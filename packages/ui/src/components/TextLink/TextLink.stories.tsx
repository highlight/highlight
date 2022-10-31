import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { TextLink } from './TextLink'

export default {
	title: 'Components/TextLink',
	component: TextLink,
} as ComponentMeta<typeof TextLink>

export const Basic = () => (
	<TextLink href="https://testing.com">Hello! 👋</TextLink>
)

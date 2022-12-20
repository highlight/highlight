import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { LinkButton } from './LinkButton'

export default {
	title: 'Components/LinkButton',
	component: LinkButton,
} as ComponentMeta<typeof LinkButton>

export const Basic = () => (
	<>
		<LinkButton to="www.example.com">Hello! 👋</LinkButton>
		<LinkButton
			kind="primary"
			size="small"
			emphasis="high"
			to="www.example.com"
		>
			Hello! 👋
		</LinkButton>
	</>
)

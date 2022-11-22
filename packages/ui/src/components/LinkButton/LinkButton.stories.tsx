import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { LinkButton } from './LinkButton'

export default {
	title: 'Components/LinkButton',
	component: LinkButton,
} as ComponentMeta<typeof LinkButton>

export const Basic = () => (
	<>
		<LinkButton href="www.example.com">Hello! 👋</LinkButton>
		<LinkButton
			kind="primary"
			size="xSmall"
			emphasis="high"
			href="www.example.com"
		>
			Hello! 👋
		</LinkButton>
	</>
)

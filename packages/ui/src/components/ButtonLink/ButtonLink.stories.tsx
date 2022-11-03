import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { ButtonLink } from './ButtonLink'

export default {
	title: 'Components/ButtonLink',
	component: ButtonLink,
} as ComponentMeta<typeof ButtonLink>

export const Basic = () => <ButtonLink>Hello! 👋</ButtonLink>

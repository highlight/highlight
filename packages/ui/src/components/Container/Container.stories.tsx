import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Container } from './Container'

export default {
	title: 'Components/Container',
	component: Container,
} as ComponentMeta<typeof Container>

export const Basic = () => <Container>Hello! 👋</Container>

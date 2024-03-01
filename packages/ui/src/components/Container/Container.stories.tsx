import { Meta } from '@storybook/react'

import { Container } from './Container'

export default {
	title: 'Components/Container',
	component: Container,
} as Meta<typeof Container>

export const Basic = () => <Container>Hello! 👋</Container>

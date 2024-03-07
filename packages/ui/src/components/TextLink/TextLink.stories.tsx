import { Meta } from '@storybook/react'

import { TextLink } from './TextLink'

export default {
	title: 'Components/TextLink',
	component: TextLink,
} as Meta<typeof TextLink>

export const Basic = () => (
	<TextLink href="https://testing.com">Hello! 👋</TextLink>
)

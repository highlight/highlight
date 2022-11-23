import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Stack } from './Stack'
import { Box } from '../Box/Box'

export default {
	title: 'Components/Stack',
	component: Stack,
} as ComponentMeta<typeof Stack>

const Content: React.FC<React.PropsWithChildren> = ({ children }) => (
	<Box background="neutral100" p="16">
		{children}
	</Box>
)

export const Basic = () => (
	<>
		<Stack>
			<Content>Default</Content>
			<Content>Default</Content>
			<Content>Default</Content>
			<Content>Default</Content>
		</Stack>
	</>
)

export const Horizontal = () => (
	<>
		<Stack direction="row" gap="24">
			<Content>Horizontal</Content>
			<Content>Horizontal</Content>
			<Content>Horizontal</Content>
			<Content>Horizontal</Content>
		</Stack>
	</>
)

export const Wrapped = () => (
	<>
		<Stack direction="row" gap="24" wrap>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
			<Content>Horizontal / Wrapped</Content>
		</Stack>
	</>
)

export const Responsive = () => (
	<Stack
		direction={{ tablet: 'row', mobile: 'column' }}
		gap={{ desktop: '24', tablet: '16', mobile: '12' }}
	>
		<Content>Responsive</Content>
		<Content>Responsive</Content>
		<Content>Responsive</Content>
		<Content>Responsive</Content>
		<Content>Responsive</Content>
		<Content>Responsive</Content>
	</Stack>
)

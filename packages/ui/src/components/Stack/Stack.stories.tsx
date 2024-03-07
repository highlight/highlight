import { Meta } from '@storybook/react'
import React from 'react'

import { Box } from '../Box/Box'
import { Stack } from './Stack'

export default {
	title: 'Components/Stack',
	component: Stack,
} as Meta<typeof Stack>

const Content: React.FC<React.PropsWithChildren> = ({ children }) => (
	<Box background="n2" p="16">
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
		<Stack direction="row" gap="24">
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

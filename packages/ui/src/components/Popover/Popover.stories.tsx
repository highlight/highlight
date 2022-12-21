import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Popover, PopoverProps } from './Popover'
import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'

export default {
	title: 'Components/Popover',
	component: Popover,
} as ComponentMeta<typeof Popover>

const Content: React.FC = () => {
	return (
		<Box
			padding="4"
			borderRadius="6"
			border="secondary"
			backgroundColor="white"
		>
			Some content inside a popover!
		</Box>
	)
}

export const Basic = () => (
	<Popover>
		<Popover.ButtonTrigger>Open Sesame!</Popover.ButtonTrigger>
		<Popover.Content>
			<Content />
		</Popover.Content>
	</Popover>
)

export const Triggers = () => {
	return (
		<Stack align="center" direction="column" gap="20">
			<Box>
				<Popover>
					<Popover.ButtonTrigger kind="secondary" emphasis="medium">
						Button (default)
					</Popover.ButtonTrigger>
					<Popover.Content>
						<Content />
					</Popover.Content>
				</Popover>
			</Box>

			<Box>
				<Popover>
					<Popover.TagTrigger kind="grey">Tag</Popover.TagTrigger>
					<Popover.Content>
						<Content />
					</Popover.Content>
				</Popover>
			</Box>
		</Stack>
	)
}

export const Placements = () => {
	const Content: React.FC<React.PropsWithChildren<PopoverProps>> = ({
		children,
		...props
	}) => (
		<Box
			backgroundColor="n2"
			p="20"
			my="20"
			mx="auto"
			display="flex"
			alignItems="center"
			justifyContent="center"
			style={{ maxWidth: 500 }}
		>
			<Popover {...props}>
				<Popover.ButtonTrigger>{children}</Popover.ButtonTrigger>
				<Popover.Content>
					<Content />
				</Popover.Content>
			</Popover>
		</Box>
	)

	return (
		<>
			<Content placement="top-end">Top End</Content>
			<Content placement="top">Top</Content>
			<Content placement="top-start">Top Start</Content>
			<Content placement="right-end">Right End</Content>
			<Content placement="right">Right</Content>
			<Content placement="right-start">Right Start</Content>
			<Content placement="bottom-start">Bottom Start</Content>
			<Content placement="bottom">Bottom</Content>
			<Content placement="bottom-end">Bottom End</Content>
			<Content placement="left-start">Left Start</Content>
			<Content placement="left">Left</Content>
			<Content placement="left-end">Left End</Content>
		</>
	)
}

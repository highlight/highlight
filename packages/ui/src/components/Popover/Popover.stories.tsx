import { Meta } from '@storybook/react'
import React from 'react'

import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Popover, PopoverProps } from './Popover'

export default {
	title: 'Components/Popover',
	component: Popover,
} as Meta<typeof Popover>

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
					<Popover.TagTrigger kind="secondary">
						Tag
					</Popover.TagTrigger>
					<Popover.Content>
						<Content />
					</Popover.Content>
				</Popover>
			</Box>
		</Stack>
	)
}

export const Placement = () => {
	return (
		<>
			<PlacementContent placement="top-end">Top End</PlacementContent>
			<PlacementContent placement="top">Top</PlacementContent>
			<PlacementContent placement="top-start">Top Start</PlacementContent>
			<PlacementContent placement="right-end">Right End</PlacementContent>
			<PlacementContent placement="right">Right</PlacementContent>
			<PlacementContent placement="right-start">
				Right Start
			</PlacementContent>
			<PlacementContent placement="bottom-start">
				Bottom Start
			</PlacementContent>
			<PlacementContent placement="bottom">Bottom</PlacementContent>
			<PlacementContent placement="bottom-end">
				Bottom End
			</PlacementContent>
			<PlacementContent placement="left-start">
				Left Start
			</PlacementContent>
			<PlacementContent placement="left">Left</PlacementContent>
			<PlacementContent placement="left-end">Left End</PlacementContent>
		</>
	)
}

const PlacementContent: React.FC<React.PropsWithChildren<PopoverProps>> = ({
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

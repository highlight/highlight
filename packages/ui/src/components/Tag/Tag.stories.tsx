import { Tag } from './Tag'
import type { ComponentMeta } from '@storybook/react'
import React from 'react'
import {
	IconArrowsExpand,
	IconArrowSmDown,
	IconChartBar,
	IconCog,
} from '../icons'
import { Box } from '../Box/Box'

export default {
	title: 'Components/Tag',
	component: Tag,
} as ComponentMeta<typeof Tag>

export const Sizes = () => {
	return (
		<Box
			alignItems="flex-start"
			display="flex"
			flexDirection="column"
			gap="16"
		>
			<Tag size="small">Small</Tag>
			<Tag size="medium">Medium</Tag>
			<Tag size="large">Large</Tag>
			<Tag shape="basic" size="small">
				Small
			</Tag>
			<Tag shape="basic" size="medium">
				Medium
			</Tag>
			<Tag shape="basic" size="large">
				Large
			</Tag>
		</Box>
	)
}

export const Variants = () => {
	return (
		<Box
			alignItems="flex-start"
			display="flex"
			flexDirection="column"
			gap="16"
		>
			<Tag variant="primary">Primary</Tag>
			<Tag variant="white">White</Tag>
			<Tag variant="grey">Grey</Tag>
		</Box>
	)
}

export const Icons = () => {
	return (
		<Box
			alignItems="flex-start"
			display="flex"
			flexDirection="column"
			gap="16"
		>
			<Tag size="large" icon={<IconCog />} />
			<Tag size="large" variant="primary" iconLeft={<IconArrowSmDown />}>
				Primary
			</Tag>
			<Tag size="large" variant="white" iconRight={<IconArrowsExpand />}>
				White
			</Tag>
			<Tag
				size="large"
				variant="grey"
				iconLeft={<IconCog />}
				iconRight={<IconChartBar />}
			>
				Grey
			</Tag>
		</Box>
	)
}

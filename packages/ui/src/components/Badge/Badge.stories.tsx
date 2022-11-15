import React from 'react'
import { Badge } from './Badge'
import type { ComponentMeta } from '@storybook/react'
import { IconArrowSmDown } from '../icons'
import { Box } from '../Box/Box'

export default {
	title: 'Components/Badge',
	component: Badge,
} as ComponentMeta<typeof Badge>

export const Sizes = () => (
	<>
		<Badge size="small" label="Small" />
		<br />
		<Badge size="medium" label="Medium" />
		<br />
		<Badge size="large" label="Large" />
		<br />
		<Badge shape="round" size="small" label="Small" />
		<br />
		<Badge shape="round" size="medium" label="Medium" />
		<br />
		<Badge shape="round" size="large" label="Large" />
	</>
)

export const Themes = () => (
	<>
		<Badge theme="green" label="Green" />
		<br />
		<Badge theme="white" label="White" />
		<br />
		<Badge theme="outlineGrey" label="Outline Grey" />
		<br />
		<Badge theme="grey" label="Grey" />
	</>
)

export const Icons = () => (
	<Box display="flex" gap="16">
		<Badge iconStart={<IconArrowSmDown />} />
		<Badge iconStart={<IconArrowSmDown />} theme="green" />
		<Badge iconStart={<IconArrowSmDown />} theme="grey" />
	</Box>
)

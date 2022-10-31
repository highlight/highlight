import { Badge } from './Badge'
import type { ComponentMeta } from '@storybook/react'
import React from 'react'

export default {
	title: 'Components/Badge',
	component: Badge,
} as ComponentMeta<typeof Badge>

export const Sizes = () => {
	return (
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
}

export const Themes = () => {
	return (
		<>
			<Badge variant="green" label="Green" />
			<br />
			<Badge variant="white" label="White" />
			<br />
			<Badge variant="outlineGrey" label="Outline Grey" />
			<br />
			<Badge variant="grey" label="Grey" />
		</>
	)
}

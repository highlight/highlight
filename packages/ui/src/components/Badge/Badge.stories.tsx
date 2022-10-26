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
		</>
	)
}

export const Themes = () => {
	return (
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
}
